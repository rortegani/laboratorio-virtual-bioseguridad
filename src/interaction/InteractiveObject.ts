export type InteractionAction = () => void;

export class InteractiveObject {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string,
    public readonly maxDistance: number,
    public readonly action: InteractionAction,
  ) {}
}
