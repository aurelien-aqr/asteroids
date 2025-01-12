/**
 * engine.js
 * ECS container
 */
export class ECS {
    constructor() {
        this.entities = new Map();
        this.componentsByType = new Map();
        this.systems = [];
        this.nextEntityId = 1;
    }

    createEntity() {
        const e = this.nextEntityId++;
        this.entities.set(e, []);
        return e;
    }

    addComponent(entity, component) {
        this.entities.get(entity).push(component);
        const compName = component.constructor.name;
        if (!this.componentsByType.has(compName)) {
            this.componentsByType.set(compName, new Map());
        }
        this.componentsByType.get(compName).set(entity, component);
    }

    removeEntity(entity) {
        if (!this.entities.has(entity)) return;
        const comps = this.entities.get(entity);
        for (const c of comps) {
            const compName = c.constructor.name;
            this.componentsByType.get(compName)?.delete(entity);
        }
        this.entities.delete(entity);
    }

    getComponent(entity, componentClass) {
        const compName = componentClass.name;
        return this.componentsByType.get(compName)?.get(entity);
    }

    getEntitiesWithComponents(...componentClasses) {
        if (componentClasses.length === 0) return [];
        const [first, ...rest] = componentClasses;
        const compMap = this.componentsByType.get(first.name) || new Map();

        const results = [];
        for (const [entity] of compMap) {
            let ok = true;
            for (const other of rest) {
                if (!this.componentsByType.get(other.name)?.has(entity)) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                results.push(entity);
            }
        }
        return results;
    }

    addSystem(systemFunction) {
        this.systems.push(systemFunction);
    }

    updateSystems(dt) {
        for (const sys of this.systems) {
            sys(this, dt);
        }
    }
}
