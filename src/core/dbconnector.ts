export default interface DBConnector<T> {
  db: T;
  connect(): Promise<T>;
}
