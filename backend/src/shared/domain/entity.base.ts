export abstract class Entity<TId = string> {
  protected constructor(public readonly id: TId) {}

  equals(other?: Entity<TId>): boolean {
    return !!other && other.id === this.id;
  }
}
