export type HandlerAnnotation<Method> = (
  target: object,
  name: string | symbol,
  descriptor: TypedPropertyDescriptor<Method>,
) => void;
