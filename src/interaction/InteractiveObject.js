export class InteractiveObject {
    id;
    name;
    type;
    maxDistance;
    action;
    constructor(id, name, type, maxDistance, action) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.maxDistance = maxDistance;
        this.action = action;
    }
}
