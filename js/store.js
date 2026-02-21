/* ===================================================================
   store.js — Data Layer (Supabase) + Audit Trail
   Devise : Dirham Marocain (MAD)
   =================================================================== */

const Store = (() => {

    // ===== UTILITY FUNCTIONS =====
    function formatMoney(amount) {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    function getMonthName(month) {
        const names = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return names[month];
    }

    function getUserId() {
        return Auth.getUserId();
    }

    // -------- Audit --------
    async function addAuditEntry(action, entity, entityId, details) {
        const userId = getUserId();
        if (!userId) return;
        await supabaseClient.from('audit_log').insert({
            user_id: userId,
            action,
            entity,
            entity_id: entityId,
            details
        });
    }

    // ===== CATEGORIES =====
    const Categories = {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('categories')
                .select('*')
                .eq('user_id', getUserId())
                .order('name');
            return error ? [] : data.map(mapCategory);
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();
            return error ? null : mapCategory(data);
        },
        async getByType(type) {
            const all = await this.getAll();
            return all.filter(c => c.type === type || c.type === 'both');
        },
        async create(catData) {
            const { data, error } = await supabaseClient
                .from('categories')
                .insert({
                    user_id: getUserId(),
                    name: catData.name,
                    type: catData.type,
                    icon: catData.icon || 'fas fa-tag',
                    color: catData.color || '#22C55E'
                })
                .select()
                .single();
            if (error) { console.error('Category create error:', error); return null; }
            const cat = mapCategory(data);
            await addAuditEntry('create', 'category', cat.id, `Catégorie créée : ${cat.name}`);
            return cat;
        },
        async update(id, catData) {
            const old = await this.getById(id);
            const updateObj = { updated_at: new Date().toISOString() };
            if (catData.name !== undefined) updateObj.name = catData.name;
            if (catData.type !== undefined) updateObj.type = catData.type;
            if (catData.icon !== undefined) updateObj.icon = catData.icon;
            if (catData.color !== undefined) updateObj.color = catData.color;

            const { data, error } = await supabaseClient
                .from('categories')
                .update(updateObj)
                .eq('id', id)
                .select()
                .single();
            if (error) return null;
            const cat = mapCategory(data);
            await addAuditEntry('update', 'category', id, `Catégorie modifiée : ${old?.name || ''} → ${cat.name}`);
            return cat;
        },
        async delete(id) {
            const cat = await this.getById(id);
            if (!cat) return false;
            const { error } = await supabaseClient.from('categories').delete().eq('id', id);
            if (error) return false;
            await addAuditEntry('delete', 'category', id, `Catégorie supprimée : ${cat.name}`);
            return true;
        }
    };

    // ===== TRANSACTIONS =====
    const Transactions = {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('user_id', getUserId())
                .order('date', { ascending: false });
            return error ? [] : data.map(mapTransaction);
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('id', id)
                .single();
            return error ? null : mapTransaction(data);
        },
        async getByMonth(year, month) {
            const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const endMonth = month + 1 > 11 ? 0 : month + 1;
            const endYear = month + 1 > 11 ? year + 1 : year;
            const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

            const { data, error } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('user_id', getUserId())
                .gte('date', startDate)
                .lt('date', endDate)
                .order('date', { ascending: false });
            return error ? [] : data.map(mapTransaction);
        },
        async getByYear(year) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('user_id', getUserId())
                .gte('date', `${year}-01-01`)
                .lte('date', `${year}-12-31`)
                .order('date', { ascending: false });
            return error ? [] : data.map(mapTransaction);
        },
        async create(txData) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .insert({
                    user_id: getUserId(),
                    type: txData.type,
                    category_id: txData.categoryId,
                    amount: txData.amount,
                    date: txData.date,
                    description: txData.description,
                    notes: txData.notes || null,
                    recurring_id: txData.recurringId || null
                })
                .select()
                .single();
            if (error) { console.error('Transaction create error:', error); return null; }
            const tx = mapTransaction(data);
            const cats = await Categories.getAll();
            const cat = cats.find(c => c.id === tx.categoryId);
            await addAuditEntry('create', 'transaction', tx.id,
                `${tx.type === 'expense' ? 'Dépense' : 'Revenu'} : ${tx.description} — ${formatMoney(tx.amount)} (${cat ? cat.name : 'Inconnue'})`);
            return tx;
        },
        async update(id, txData) {
            const old = await this.getById(id);
            const updateObj = { updated_at: new Date().toISOString() };
            if (txData.type !== undefined) updateObj.type = txData.type;
            if (txData.categoryId !== undefined) updateObj.category_id = txData.categoryId;
            if (txData.amount !== undefined) updateObj.amount = txData.amount;
            if (txData.date !== undefined) updateObj.date = txData.date;
            if (txData.description !== undefined) updateObj.description = txData.description;
            if (txData.notes !== undefined) updateObj.notes = txData.notes;

            const { data, error } = await supabaseClient
                .from('transactions')
                .update(updateObj)
                .eq('id', id)
                .select()
                .single();
            if (error) return null;
            const tx = mapTransaction(data);
            await addAuditEntry('update', 'transaction', id,
                `Transaction modifiée : ${old?.description || ''} (${formatMoney(old?.amount || 0)}) → ${tx.description} (${formatMoney(tx.amount)})`);
            return tx;
        },
        async delete(id) {
            const tx = await this.getById(id);
            if (!tx) return false;
            const { error } = await supabaseClient.from('transactions').delete().eq('id', id);
            if (error) return false;
            await addAuditEntry('delete', 'transaction', id,
                `Transaction supprimée : ${tx.description} — ${formatMoney(tx.amount)}`);
            return true;
        }
    };

    // ===== BUDGETS =====
    const Budgets = {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('budgets')
                .select('*')
                .eq('user_id', getUserId());
            return error ? [] : data.map(mapBudget);
        },
        async getByMonth(year, month) {
            const { data, error } = await supabaseClient
                .from('budgets')
                .select('*')
                .eq('user_id', getUserId())
                .eq('year', year)
                .eq('month', month);
            return error ? [] : data.map(mapBudget);
        },
        async getByYear(year) {
            const { data, error } = await supabaseClient
                .from('budgets')
                .select('*')
                .eq('user_id', getUserId())
                .eq('year', year);
            return error ? [] : data.map(mapBudget);
        },
        async createOrUpdate(bData) {
            const { data: existing } = await supabaseClient
                .from('budgets')
                .select('*')
                .eq('user_id', getUserId())
                .eq('category_id', bData.categoryId)
                .eq('year', bData.year)
                .eq('month', bData.month)
                .maybeSingle();

            const cats = await Categories.getAll();
            const cat = cats.find(c => c.id === bData.categoryId);
            const catName = cat ? cat.name : 'Inconnue';

            if (existing) {
                const oldAmount = existing.amount;
                const { data, error } = await supabaseClient
                    .from('budgets')
                    .update({
                        amount: bData.amount,
                        notes: bData.notes || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (error) return null;
                await addAuditEntry('update', 'budget', existing.id,
                    `Budget modifié pour ${catName} : ${formatMoney(oldAmount)} → ${formatMoney(bData.amount)}`);
                return mapBudget(data);
            } else {
                const { data, error } = await supabaseClient
                    .from('budgets')
                    .insert({
                        user_id: getUserId(),
                        category_id: bData.categoryId,
                        amount: bData.amount,
                        year: bData.year,
                        month: bData.month,
                        notes: bData.notes || null
                    })
                    .select()
                    .single();
                if (error) { console.error('Budget create error:', error); return null; }
                await addAuditEntry('create', 'budget', data.id,
                    `Budget créé pour ${catName} : ${formatMoney(bData.amount)}`);
                return mapBudget(data);
            }
        },
        async delete(id) {
            const { data: b } = await supabaseClient.from('budgets').select('*').eq('id', id).single();
            if (!b) return false;
            const cats = await Categories.getAll();
            const cat = cats.find(c => c.id === b.category_id);
            const { error } = await supabaseClient.from('budgets').delete().eq('id', id);
            if (error) return false;
            await addAuditEntry('delete', 'budget', id,
                `Budget supprimé pour ${cat ? cat.name : 'Inconnue'} : ${formatMoney(b.amount)}`);
            return true;
        },
        async copyFromPreviousMonth(year, month) {
            let prevMonth = month - 1;
            let prevYear = year;
            if (prevMonth < 0) { prevMonth = 11; prevYear--; }
            const prevBudgets = await this.getByMonth(prevYear, prevMonth);
            let count = 0;
            for (const pb of prevBudgets) {
                await this.createOrUpdate({
                    categoryId: pb.categoryId,
                    amount: pb.amount,
                    notes: pb.notes,
                    year,
                    month
                });
                count++;
            }
            if (count > 0) {
                await addAuditEntry('create', 'budget', null,
                    `${count} budgets copiés depuis ${getMonthName(prevMonth)} ${prevYear}`);
            }
            return count;
        }
    };

    // ===== RECURRING =====
    const Recurring = {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('recurring')
                .select('*')
                .eq('user_id', getUserId())
                .order('created_at', { ascending: false });
            return error ? [] : data.map(mapRecurring);
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('recurring')
                .select('*')
                .eq('id', id)
                .single();
            return error ? null : mapRecurring(data);
        },
        async create(rData) {
            const { data, error } = await supabaseClient
                .from('recurring')
                .insert({
                    user_id: getUserId(),
                    type: rData.type,
                    category_id: rData.categoryId,
                    description: rData.description,
                    amount: rData.amount,
                    frequency: rData.frequency,
                    start_date: rData.startDate,
                    end_date: rData.endDate || null,
                    active: true
                })
                .select()
                .single();
            if (error) { console.error('Recurring create error:', error); return null; }
            const rec = mapRecurring(data);
            await addAuditEntry('create', 'recurring', rec.id,
                `Récurrence créée : ${rec.description} — ${formatMoney(rec.amount)} (${rec.frequency})`);
            return rec;
        },
        async update(id, rData) {
            const updateObj = { updated_at: new Date().toISOString() };
            if (rData.type !== undefined) updateObj.type = rData.type;
            if (rData.categoryId !== undefined) updateObj.category_id = rData.categoryId;
            if (rData.description !== undefined) updateObj.description = rData.description;
            if (rData.amount !== undefined) updateObj.amount = rData.amount;
            if (rData.frequency !== undefined) updateObj.frequency = rData.frequency;
            if (rData.startDate !== undefined) updateObj.start_date = rData.startDate;
            if (rData.endDate !== undefined) updateObj.end_date = rData.endDate;
            if (rData.active !== undefined) updateObj.active = rData.active;
            if (rData.lastGenerated !== undefined) updateObj.last_generated = rData.lastGenerated;

            const { data, error } = await supabaseClient
                .from('recurring')
                .update(updateObj)
                .eq('id', id)
                .select()
                .single();
            if (error) return null;
            const rec = mapRecurring(data);
            await addAuditEntry('update', 'recurring', id, `Récurrence modifiée : ${rec.description}`);
            return rec;
        },
        async delete(id) {
            const rec = await this.getById(id);
            if (!rec) return false;
            const { error } = await supabaseClient.from('recurring').delete().eq('id', id);
            if (error) return false;
            await addAuditEntry('delete', 'recurring', id, `Récurrence supprimée : ${rec.description}`);
            return true;
        },
        async toggleActive(id) {
            const rec = await this.getById(id);
            if (!rec) return null;
            const newActive = !rec.active;
            const { data, error } = await supabaseClient
                .from('recurring')
                .update({ active: newActive, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) return null;
            const updated = mapRecurring(data);
            await addAuditEntry('update', 'recurring', id,
                `Récurrence ${newActive ? 'activée' : 'désactivée'} : ${updated.description}`);
            return updated;
        },
        async processRecurring() {
            const today = new Date().toISOString().split('T')[0];
            const items = await this.getAll();
            const active = items.filter(r => r.active);
            let generated = 0;

            for (const rec of active) {
                if (rec.endDate && rec.endDate < today) {
                    await this.update(rec.id, { active: false });
                    continue;
                }

                const lastGen = rec.lastGenerated || rec.startDate;
                const nextDue = getNextDueDate(lastGen, rec.frequency);

                if (nextDue <= today) {
                    await Transactions.create({
                        type: rec.type,
                        categoryId: rec.categoryId,
                        amount: rec.amount,
                        date: nextDue,
                        description: rec.description + ' (récurrent)',
                        notes: 'Généré automatiquement depuis la récurrence',
                        recurringId: rec.id
                    });
                    await supabaseClient
                        .from('recurring')
                        .update({ last_generated: nextDue })
                        .eq('id', rec.id);
                    generated++;
                }
            }
            return generated;
        }
    };

    // ===== GOALS =====
    const Goals = {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('goals')
                .select('*')
                .eq('user_id', getUserId())
                .order('created_at', { ascending: false });
            return error ? [] : data.map(mapGoal);
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('goals')
                .select('*')
                .eq('id', id)
                .single();
            return error ? null : mapGoal(data);
        },
        async create(gData) {
            const { data, error } = await supabaseClient
                .from('goals')
                .insert({
                    user_id: getUserId(),
                    name: gData.name,
                    target_amount: gData.targetAmount,
                    current_amount: gData.currentAmount || 0,
                    deadline: gData.deadline || null,
                    color: gData.color || '#22C55E',
                    notes: gData.notes || null
                })
                .select()
                .single();
            if (error) { console.error('Goal create error:', error); return null; }
            const goal = mapGoal(data);
            await addAuditEntry('create', 'goal', goal.id,
                `Objectif créé : ${goal.name} — Cible : ${formatMoney(goal.targetAmount)}`);
            return goal;
        },
        async update(id, gData) {
            const updateObj = { updated_at: new Date().toISOString() };
            if (gData.name !== undefined) updateObj.name = gData.name;
            if (gData.targetAmount !== undefined) updateObj.target_amount = gData.targetAmount;
            if (gData.currentAmount !== undefined) updateObj.current_amount = gData.currentAmount;
            if (gData.deadline !== undefined) updateObj.deadline = gData.deadline;
            if (gData.color !== undefined) updateObj.color = gData.color;
            if (gData.notes !== undefined) updateObj.notes = gData.notes;

            const { data, error } = await supabaseClient
                .from('goals')
                .update(updateObj)
                .eq('id', id)
                .select()
                .single();
            if (error) return null;
            const goal = mapGoal(data);
            await addAuditEntry('update', 'goal', id, `Objectif modifié : ${goal.name}`);
            return goal;
        },
        async delete(id) {
            const goal = await this.getById(id);
            if (!goal) return false;
            const { error } = await supabaseClient.from('goals').delete().eq('id', id);
            if (error) return false;
            await addAuditEntry('delete', 'goal', id, `Objectif supprimé : ${goal.name}`);
            return true;
        },
        async addAmount(id, amount) {
            const goal = await this.getById(id);
            if (!goal) return null;
            const newAmount = (goal.currentAmount || 0) + amount;
            const { data, error } = await supabaseClient
                .from('goals')
                .update({ current_amount: newAmount, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) return null;
            const updated = mapGoal(data);
            await addAuditEntry('update', 'goal', id,
                `${formatMoney(amount)} ajouté à l'objectif "${updated.name}" — Total : ${formatMoney(updated.currentAmount)}`);
            return updated;
        }
    };

    // ===== AUDIT =====
    const Audit = {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('audit_log')
                .select('*')
                .eq('user_id', getUserId())
                .order('created_at', { ascending: false })
                .limit(500);
            return error ? [] : data.map(mapAudit);
        },
        async getFiltered(filters = {}) {
            let query = supabaseClient
                .from('audit_log')
                .select('*')
                .eq('user_id', getUserId())
                .order('created_at', { ascending: false })
                .limit(500);

            if (filters.action) query = query.eq('action', filters.action);
            if (filters.entity) query = query.eq('entity', filters.entity);

            const { data, error } = await query;
            return error ? [] : data.map(mapAudit);
        },
        async clear() {
            await supabaseClient.from('audit_log').delete().eq('user_id', getUserId());
        }
    };

    // ===== EXPORT / IMPORT =====
    async function exportAll() {
        const [categories, transactions, budgets, recurring, goals, audit] = await Promise.all([
            Categories.getAll(),
            Transactions.getAll(),
            Budgets.getAll(),
            Recurring.getAll(),
            Goals.getAll(),
            Audit.getAll()
        ]);
        // Include inventory if available
        let inventory = [];
        if (typeof Inventory !== 'undefined') {
            try { inventory = await Inventory.getAll(); } catch(e) {}
        }
        return JSON.stringify({
            version: '2.1',
            exportedAt: new Date().toISOString(),
            categories, transactions, budgets, recurring, goals, audit, inventory
        }, null, 2);
    }

    async function importAll(jsonString) {
        try {
            const importData = JSON.parse(jsonString);
            const userId = getUserId();

            if (importData.categories && importData.categories.length > 0) {
                for (const cat of importData.categories) {
                    await supabaseClient.from('categories').insert({
                        user_id: userId,
                        name: cat.name,
                        type: cat.type,
                        icon: cat.icon || 'fas fa-tag',
                        color: cat.color || '#22C55E'
                    });
                }
            }

            const newCats = await Categories.getAll();
            const catMap = {};
            if (importData.categories) {
                importData.categories.forEach(oldCat => {
                    const match = newCats.find(c => c.name === oldCat.name);
                    if (match) catMap[oldCat.id] = match.id;
                });
            }

            if (importData.transactions) {
                for (const tx of importData.transactions) {
                    await supabaseClient.from('transactions').insert({
                        user_id: userId,
                        type: tx.type,
                        category_id: catMap[tx.categoryId] || null,
                        amount: tx.amount,
                        date: tx.date,
                        description: tx.description,
                        notes: tx.notes
                    });
                }
            }

            if (importData.budgets) {
                for (const b of importData.budgets) {
                    const catId = catMap[b.categoryId] || null;
                    if (catId) {
                        await supabaseClient.from('budgets').upsert({
                            user_id: userId,
                            category_id: catId,
                            amount: b.amount,
                            year: b.year,
                            month: b.month,
                            notes: b.notes
                        }, { onConflict: 'user_id, category_id, year, month' });
                    }
                }
            }

            if (importData.goals) {
                for (const g of importData.goals) {
                    await supabaseClient.from('goals').insert({
                        user_id: userId,
                        name: g.name,
                        target_amount: g.targetAmount,
                        current_amount: g.currentAmount || 0,
                        deadline: g.deadline,
                        color: g.color,
                        notes: g.notes
                    });
                }
            }

            await addAuditEntry('create', 'system', null, 'Données importées depuis un fichier');
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }

    // ===== MAPPERS (snake_case → camelCase) =====
    function mapCategory(row) {
        if (!row) return null;
        return { id: row.id, name: row.name, type: row.type, icon: row.icon, color: row.color, createdAt: row.created_at, updatedAt: row.updated_at };
    }

    function mapTransaction(row) {
        if (!row) return null;
        return { id: row.id, type: row.type, categoryId: row.category_id, amount: parseFloat(row.amount), date: row.date, description: row.description, notes: row.notes, recurringId: row.recurring_id, createdAt: row.created_at, updatedAt: row.updated_at };
    }

    function mapBudget(row) {
        if (!row) return null;
        return { id: row.id, categoryId: row.category_id, amount: parseFloat(row.amount), year: row.year, month: row.month, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at };
    }

    function mapRecurring(row) {
        if (!row) return null;
        return { id: row.id, type: row.type, categoryId: row.category_id, description: row.description, amount: parseFloat(row.amount), frequency: row.frequency, startDate: row.start_date, endDate: row.end_date, active: row.active, lastGenerated: row.last_generated, createdAt: row.created_at, updatedAt: row.updated_at };
    }

    function mapGoal(row) {
        if (!row) return null;
        return { id: row.id, name: row.name, targetAmount: parseFloat(row.target_amount), currentAmount: parseFloat(row.current_amount || 0), deadline: row.deadline, color: row.color, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at };
    }

    function mapAudit(row) {
        if (!row) return null;
        return { id: row.id, action: row.action, entity: row.entity, entityId: row.entity_id, details: row.details, timestamp: row.created_at };
    }

    function getNextDueDate(fromDate, frequency) {
        const d = new Date(fromDate);
        switch (frequency) {
            case 'weekly': d.setDate(d.getDate() + 7); break;
            case 'monthly': d.setMonth(d.getMonth() + 1); break;
            case 'quarterly': d.setMonth(d.getMonth() + 3); break;
            case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
        }
        return d.toISOString().split('T')[0];
    }

    return {
        Categories,
        Transactions,
        Budgets,
        Recurring,
        Goals,
        Audit,
        exportAll,
        importAll,
        formatMoney,
        getMonthName
    };
})();
