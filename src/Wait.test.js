import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import PropTypes from 'prop-types';
import sinon from 'sinon';
import Wait from './Wait';

const ComponentA = () => '';
ComponentA.propTypes = { a: PropTypes.any };

const getSubject = (Component, props = {}, { propTypes, WaitComponent, toggle } = {}) => {
    const Waited = Wait(Component, { propTypes, WaitComponent, toggle });
    return shallow(<Waited {...props} />);
};

describe('Wait', () => {
    describe('all default values', () => {
        it('renders nothing when propTypes are not met', () => {
            const subject = getSubject(ComponentA);
            expect(subject.type()).to.equal(null);
        });

        it('renders the component when propTypes are met', () => {
            const subject = getSubject(ComponentA, { a: true });
            expect(subject.type()).to.equal(ComponentA);
        });
    });

    describe('with an alternate component', () => {
        it('renders the provided alternate component when the condition fails', () => {
            const Alternate = () => '';
            const subject = getSubject(ComponentA, {}, { WaitComponent: Alternate });
            expect(subject.type()).to.equal(Alternate);
        });
    });

    describe('custom prop types', () => {
        it('renders nothing when the custom propTypes are not met', () => {
            const subject = getSubject(ComponentA, { a: true }, { propTypes: { b: true } });
            expect(subject.type()).to.equal(null);
        });

        it('renders the component when the custom propTypes are met', () => {
            const subject = getSubject(ComponentA, { b: true }, { propTypes: { b: true } });
            expect(subject.type()).to.equal(ComponentA);
        });
    });

    describe('custom toggle', () => {
        it('calls the toggle to determine which component to render', () => {
            const toggle = sinon.spy();
            getSubject(ComponentA, {}, { toggle });
            // eslint-disable-next-line
            expect(toggle).to.have.been.called;
        });

        it('renders the primary component on true', () => {
            const subject = getSubject(ComponentA, {}, { toggle: () => true });
            expect(subject.type()).to.equal(ComponentA);
        });

        it('renders the alternate component on false', () => {
            const subject = getSubject(ComponentA, {}, { toggle: () => false });
            expect(subject.type()).to.equal(null);
        });
    });
});
