import { SerializableParam } from "recoil";

export class OverspecError extends Error {
  constructor(pathSpec: string, params: SerializableParam, notFound: string) {
    super(
      `Failed to interpolate ${params?.toString()} into ${pathSpec}. Found ${notFound} in params but not path spec`
    );
  }
}

export class UnderspecError extends Error {
  constructor(pathSpec: string, params: SerializableParam, notFound: string[]) {
    super(
      `Failed to interpolate ${params?.toString()} into ${pathSpec}. Found ${notFound.join(
        ","
      )} in path spec but not params`
    );
  }
}

export interface PathParameters extends Record<string, string> {}

// this type param problably doesn't do anything for us
// maybe it does because we could write a type guard on the pathSpec string
// TODO this is internal to the libary. maybe there's a public interface that
// supports a generic data loader, but otherwise if we verify the bolt file right,
// we don't actually have to worry about error handling here
export function interpolatePathSpec<P extends PathParameters>(
  pathSpec: string,
  params: P
): string {
  // for every key, myKey, in params, we expect to see a substring {myKey} in the pathSpec
  // curly brances are otherwise not legal in pathSpecs TODO confirm that
  // validate resulting string?
  // TODO can a path parameter appear more than once in a path spec?
  const innerInterpolated = Object.entries(params).reduce(
    (existingPathSpec, [key, value]) => {
      const keyMarker = `{${key}}`;
      if (existingPathSpec.includes(keyMarker)) {
        return existingPathSpec.replace(`{${key}}`, value);
      } else {
        throw new OverspecError(pathSpec, params, key);
      }
    },
    pathSpec
  );

  const remainingParamMarkersRegex = /\{([^}])\}/;

  const matches = pathSpec.match(remainingParamMarkersRegex);

  if (matches !== null) {
    throw new UnderspecError(pathSpec, params, matches);
  }

  return innerInterpolated;

  // TODO for array notation, there won't be a curly-braced entry, we'll just have to add it
  // to the end
}
