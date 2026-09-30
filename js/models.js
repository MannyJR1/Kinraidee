class Entity {
    constructor(id = null) {
        this.id = id || this.generateId();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    }
}

class BaseMenu extends Entity {
    #containsPork;

    constructor({ id = null, name, budget, category, ingredients = '-', containsPork = false }) {
        super(id); 
        this.name = name;
        this.budget = budget;
        this.category = category;
        this.ingredients = ingredients;
        this.#containsPork = Boolean(containsPork);
    }

    isPork() {
        return this.#containsPork;
    }

    getSummary() {
        return `${this.name} (${this.category} • ${this.budget} บ.)`;
    }
}

class StandardMenu extends BaseMenu {
    constructor(data) {
        super(data);
    }

    getSummary() {
        return `[เมนูแนะนำ] ${this.name} • ${this.budget} บ.`;
    }
}

class CustomMenu extends BaseMenu {
    constructor(data) {
        super(data);
        this.isCustom = true;
    }
    getSummary() {
        return `[เมนูส่วนตัว] ${this.name} • ${this.budget} บ.`;
    }
}