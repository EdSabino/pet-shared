export function database(mongoose) {
  return async (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    await mongoose.connect(process.env.MONGO_URI);
    return descriptor;
  };
}
