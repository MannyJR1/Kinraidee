class CleanFoodApp {
    constructor() {
        this.store = new StorageController();
        this.sound = new SoundEngine();
        this.selectedBudget = 'all';
        this.currentResult = null;

        this.initDOM();
        this.initEvents();
        this.renderAll();
    }

    initDOM() {
        this.slotDisplay = document.getElementById('slot-display');
        this.btnSpin = document.getElementById('btn-spin');
        this.resultSheet = document.getElementById('result-sheet');
        this.selectCategory = document.getElementById('select-category');
        this.checkPork = document.getElementById('check-pork');
        this.checkCooldown = document.getElementById('check-cooldown');
    }

    initEvents() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-view');
                document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
                document.getElementById(`view-${target}`).classList.remove('hidden');

                document.querySelectorAll('.nav-tab').forEach(t => {
                    t.classList.remove('tab-item-active');
                    t.classList.add('text-gray-500');
                });
                tab.classList.add('tab-item-active');
                tab.classList.remove('text-gray-500');
            });
        });

        document.querySelectorAll('#budget-chips .chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#budget-chips .chip-btn').forEach(b => {
                    b.classList.remove('chip-active');
                    b.classList.add('text-gray-600');
                });
                btn.classList.add('chip-active');
                btn.classList.remove('text-gray-600');
                this.selectedBudget = btn.getAttribute('data-budget');
            });
        });

        this.btnSpin.addEventListener('click', () => this.spin());
        document.getElementById('modal-btn-spin-again').addEventListener('click', () => {
            this.resultSheet.classList.add('hidden');
            this.spin();
        });

        document.getElementById('modal-btn-confirm').addEventListener('click', () => {
            if (this.currentResult) {
                this.store.record(this.currentResult);
                this.renderHistory();
                this.resultSheet.classList.add('hidden');
                alert(`บันทึกแล้ว เมนู "${this.currentResult.name}" จะถูกพักไม่ให้สุ่มซ้ำเป็นเวลา 3 วัน`);
            }
        });
        document.getElementById('modal-btn-dismiss').addEventListener('click', () => this.resultSheet.classList.add('hidden'));

        document.getElementById('modal-btn-copy').addEventListener('click', () => {
            if (!this.currentResult) return;
            const m = this.currentResult;
            const text = `มื้อนี้กิน: ${m.name}\nงบประมาณ: ${m.budget} บาท\nหมวดหมู่: ${m.category}`;
            navigator.clipboard.writeText(text).then(() => alert('คัดลอกข้อความสรุปเมนูแล้ว'));
        });

        document.getElementById('btn-clear-history').addEventListener('click', () => {
            if (confirm('คุณต้องการลบประวัติการกินทั้งหมดใช่หรือไม่?')) {
                this.store.clearHist();
                this.renderHistory();
            }
        });

        document.getElementById('form-add-menu').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('new-name').value;
            const budget = document.getElementById('new-budget').value;
            const category = document.getElementById('new-category').value;
            this.store.addMenu({
                name,
                budget,
                category,
                containsPork: false,
                ingredients: "เมนูส่วนตัวที่เพิ่มเข้าไป"
            });
            document.getElementById('form-add-menu').reset();
            this.renderMenus();
        });
    }

    spin() {
        const cutoff = Date.now() - (3 * 24 * 60 * 60 * 1000);
        const cooldownIds = this.checkCooldown.checked
            ? new Set(this.store.history.filter(h => h.timestamp >= cutoff).map(h => String(h.id)))
            : new Set();

        const candidates = this.store.menus.filter(m => {
            if (cooldownIds.has(String(m.id))) return false;
            if (this.selectedBudget !== 'all' && m.budget !== this.selectedBudget) return false;
            if (this.selectCategory.value !== 'all' && m.category !== this.selectCategory.value) return false;
            if (this.checkPork.checked && m.isPork()) return false;
            return true;
        });

        if (candidates.length === 0) {
            alert('ไม่พบเมนูที่เข้าข่ายเงื่อนไข กรุณาปรับเปลี่ยนตัวกรอง');
            return;
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        this.btnSpin.disabled = true;
        this.slotDisplay.classList.add('slot-rolling');

        let count = 0;
        const interval = setInterval(() => {
            const sample = this.store.menus[Math.floor(Math.random() * this.store.menus.length)];
            this.slotDisplay.textContent = sample.name;
            this.sound.playTick();
            count++;

            if (count > 16) {
                clearInterval(interval);
                this.slotDisplay.classList.remove('slot-rolling');
                this.currentResult = chosen;
                this.slotDisplay.textContent = chosen.name;
                this.sound.playSuccess();
                this.btnSpin.disabled = false;
                this.showModal(chosen);
            }
        }, 60);
    }

    showModal(menu) {
        document.getElementById('modal-title').textContent = menu.name;
        document.getElementById('modal-category').textContent = menu.category;
        document.getElementById('modal-budget').textContent = `งบประมาณ ${menu.budget} บาท`;
        document.getElementById('modal-desc').textContent = menu.ingredients || '-';
        this.resultSheet.classList.remove('hidden');
    }

    renderMenus() {
        const container = document.getElementById('menus-container');
        container.innerHTML = '';
        document.getElementById('total-count-badge').textContent = this.store.menus.length;

        this.store.menus.forEach(menu => {
            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm';
            div.innerHTML = `
                <div>
                    <div class="text-sm md:text-base font-bold text-gray-900">${menu.name}</div>
                    <div class="text-xs md:text-sm text-gray-500 mt-0.5">${menu.getSummary()}</div>
                </div>
                <button class="text-xs md:text-sm font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors" onclick="app.deleteItem('${menu.id}')">ลบ</button>
            `;
            container.appendChild(div);
        });
    }

    deleteItem(id) {
        this.store.deleteMenu(id);
        this.renderMenus();
    }

    renderHistory() {
        const container = document.getElementById('history-list');
        container.innerHTML = '';

        if (this.store.history.length === 0) {
            container.innerHTML = '<div class="col-span-full bg-white p-8 rounded-2xl text-center text-xs md:text-sm text-gray-400 border border-gray-200">ยังไม่มีประวัติการกิน</div>';
            return;
        }

        const cutoff = Date.now() - (3 * 24 * 60 * 60 * 1000);

        this.store.history.forEach(item => {
            const isCooldown = item.timestamp >= cutoff;
            const d = new Date(item.timestamp);
            const timeStr = `${d.getDate()}/${d.getMonth()+1} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} น.`;

            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm';
            div.innerHTML = `
                <div>
                    <div class="text-sm md:text-base font-bold text-gray-900">${item.name}</div>
                    <div class="text-xs text-gray-400 mt-0.5">${timeStr}</div>
                </div>
                <div>
                    ${isCooldown 
                        ? '<span class="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-full font-medium">พัก 3 วัน</span>'
                        : '<span class="text-xs bg-emerald-50 text-[#00B14F] border border-emerald-200 px-3 py-1 rounded-full font-medium">สุ่มได้</span>'
                    }
                </div>
            `;
            container.appendChild(div);
        });
    }

    renderAll() {
        this.renderMenus();
        this.renderHistory();
    }
}

// สร้าง Instance
const app = new CleanFoodApp();