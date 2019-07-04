import React, { Component } from 'react';

export default Editor =>
  class FocusSyncEditor extends Component {
    state = {}

    componentDidMount() {
      // create cursor
      const initialCursor = {
        userId: this.props.firebase.auth().currentUser.uid,
      };
      const cursorRef = this.props.firebase.ref(`cursors/${this.props.params.crosswordId}`)
        .push(initialCursor);

      // set up onDelete to remove the cursor
      cursorRef.onDisconnect().set(null);

      this.setState({ cursorRef });
    }

    componentWillUnmount() {
      // remove onDelete
      this.state.cursorRef.onDisconnect().cancel();
      // delete cursor
      this.state.cursorRef.set(null);
    }

    handleBoxFocus = (cursor) => {
      this.props.actions.setCursor(cursor, this.props.params.crosswordId);
      this.state.cursorRef.update(cursor);
    }

    render() {
      return <Editor {...this.props} onBoxFocus={this.handleBoxFocus} />;
    }
  };
