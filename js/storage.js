class StorageController {
    #menusKey = 'kinraidee_clean_v8';
    #histKey = 'kinraidee_hist_v8';
    #menus = [];
    #history = [];

    constructor() {
        this.#menus = this.#loadMenus();
        this.#history = this.#loadHistory();
    }

    #loadMenus() {
        const raw = localStorage.getItem(this.#menusKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            return parsed.map(item => item.isCustom ? new CustomMenu(item) : new StandardMenu(item));
        }
        const defaults = [
            { id: 1, name: "ข้าวกะเพราหมูสับไข่ดาว", budget: "50-80", category: "ข้าว/จานเดียว", containsPork: true, ingredients: "หมูสับ, ใบกะเพรา, พริกสด, ไข่ไก่" },
            { id: 2, name: "ก๋วยเตี๋ยวต้มยำน้ำข้น", budget: "50-80", category: "เมนูเส้น", containsPork: true, ingredients: "เส้นเล็ก, หมูสับ, มะนาว, พริกเผา" },
            { id: 3, name: "สลัดอกไก่ย่าง", budget: "50-80", category: "ส้มตำ/ยำ", containsPork: false, ingredients: "อกไก่ย่าง, ผักสลัดรวม, น้ำสลัดงาขาว" },
            { id: 4, name: "บะหมี่กึ่งสำเร็จรูปทรงเครื่อง", budget: "<50", category: "เมนูเส้น", containsPork: false, ingredients: "บะหมี่กึ่งสำเร็จรูป, ไข่ไก่, ผักกาดขาว" },
            { id: 5, name: "หมูกระทะชุดใหญ่", budget: "100+", category: "ข้าว/จานเดียว", containsPork: true, ingredients: "หมูหมัก, ผักรวม, วุ้นเส้น, น้ำจิ้ม" },
            { id: 6, name: "ข้าวไข่ข้นกุ้ง", budget: "50-80", category: "ข้าว/จานเดียว", containsPork: false, ingredients: "กุ้งสด, ไข่ไก่ 2 ฟอง, ซอสปรุงรส" },
            { id: 7, name: "ส้มตำไทยไก่ย่าง", budget: "50-80", category: "ส้มตำ/ยำ", containsPork: false, ingredients: "มะละกอดิบ, อกไก่ย่าง, ถั่วลิสง" }
        ];
        return defaults.map(d => new StandardMenu(d));
    }

    #loadHistory() {
        const raw = localStorage.getItem(this.#histKey);
        return raw ? JSON.parse(raw) : [];
    }

    get menus() {
        return this.#menus;
    }

    get history() {
        return this.#history;
    }

    saveMenus() {
        const plainData = this.#menus.map(m => ({
            id: m.id,
            name: m.name,
            budget: m.budget,
            category: m.category,
            ingredients: m.ingredients,
            containsPork: m.isPork(),
            isCustom: m instanceof CustomMenu
        }));
        localStorage.setItem(this.#menusKey, JSON.stringify(plainData));
    }

    saveHistory() {
        localStorage.setItem(this.#histKey, JSON.stringify(this.#history));
    }

    record(menu) {
        this.#history.unshift({
            id: menu.id,
            name: menu.name,
            budget: menu.budget,
            category: menu.category,
            timestamp: Date.now()
        });
        if (this.#history.length > 50) this.#history.pop();
        this.saveHistory();
    }

    clearHist() {
        this.#history = [];
        this.saveHistory();
    }

    addMenu(menuData) {
        const newMenu = new CustomMenu(menuData);
        this.#menus.push(newMenu);
        this.saveMenus();
    }

    deleteMenu(id) {
        this.#menus = this.#menus.filter(m => String(m.id) !== String(id));
        this.saveMenus();
    }
}