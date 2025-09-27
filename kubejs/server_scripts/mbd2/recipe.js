ServerEvents.recipes(event => {
    event.shaped("materialfactory:oak_crucible", [
		'B B',
		'BCB',
		'A A'
	], {
		A: 'minecraft:stick',
		B: 'minecraft:stripped_oak_log',
		C: 'minecraft:oak_slab'
    });
});

//巨型熔炉
/**const $ForgeHooks = Java.loadClass('net.minecraftforge.common.ForgeHooks');
ServerEvents.recipes((event) => {
     let fuelItems = {};

     Ingredient.all.stacks.forEach((itemStack) => {
        const burnTime = $ForgeHooks.getBurnTime(itemStack, 'minecraft:smelting');

         if (burnTime > 0) {
             fuelItems[itemStack.id] = burnTime;
         }
     });

    JsonIO.write('kubejs/server_scripts/mbd2/fuel_items.json', fuelItems);
});**/

ServerEvents.recipes((event) => {
    Object.entries(JsonIO.read('kubejs/server_scripts/mbd2/fuel_items.json')).forEach(([itemId, burnTime]) => {
        let recipe = event.recipes.materialfactory.huge_furnace();

        recipe.isFuel(true);
        recipe.slotName('fuel_input', (builder) => {
            builder.inputItems(itemId);
        });
        recipe.duration(burnTime);
    });
});

MBDMachineEvents.onBeforeRecipeModify('materialfactory:huge_furnace', (event) => {
    const mbdEvent = event.getEvent();
    const { machine, recipe } = mbdEvent;

    /**@type {Internal.ItemSlotCapabilityTrait} */
    let upgradeTrait = machine.getTraitByName('upgrade_slot');
    let storage = upgradeTrait.storage;
    let upgradeCount = storage.getStackInSlot(0).count;

    //let cap = machine.getCapability(ForgeCapabilities.ITEM_HANDLER).orElse(null);
    //let upgradeCount = cap.getStackInSlot(27).count;

    let parallelRecipe = machine.applyParallel(recipe, upgradeCount);
    let copyRecipe = parallelRecipe.copy();
    let reductionFactor = Math.max(1 - 0.01 * upgradeCount, 0.1);
    copyRecipe.duration = Math.ceil(recipe.duration * reductionFactor);

    mbdEvent.setRecipe(copyRecipe);
});

//黄铜多功能制作
MBDMachineEvents.onBeforeRecipeModify('materialfactory:brass_multifunctional_device', (event) => {
    const mbdEvent = event.getEvent();
    const { machine, recipe } = mbdEvent;

    // 初始化计数
    let upgradeCount0 = 0;
    let upgradeCount1 = 0;
    let upgradeCount2 = 0;
    let parallelCount = 0;

    // 检查并获取upgrade_slot中的物品数量
    try {
        let upgradeTrait0 = machine.getTraitByName('upgrade_slot');
        if (upgradeTrait0) {
            let storage0 = upgradeTrait0.storage;
            let stack0 = storage0.getStackInSlot(0);
            if (!stack0.isEmpty()) {
                upgradeCount0 = stack0.count;
            }
        }
    } catch (e) {
        console.error("Error accessing upgrade_slot: " + e);
    }

    // 检查并获取upgrade1_slot中的物品数量
    try {
        let upgradeTrait1 = machine.getTraitByName('upgrade1_slot');
        if (upgradeTrait1) {
            let storage1 = upgradeTrait1.storage;
            let stack1 = storage1.getStackInSlot(0);
            if (!stack1.isEmpty()) {
                upgradeCount1 = stack1.count;
            }
        }
    } catch (e) {
        console.error("Error accessing upgrade1_slot: " + e);
    }

    // 检查并获取upgrade2_slot中的物品数量
    try {
        let upgradeTrait2 = machine.getTraitByName('upgrade2_slot');
        if (upgradeTrait2) {
            let storage2 = upgradeTrait2.storage;
            let stack2 = storage2.getStackInSlot(0);
            if (!stack2.isEmpty()) {
                upgradeCount2 = stack2.count;
            }
        }
    } catch (e) {
        console.error("Error accessing upgrade2_slot: " + e);
    }

    // 检查并获取parallel_slot中的物品数量
    try {
        let parallelTrait = machine.getTraitByName('parallel_slot');
        if (parallelTrait) {
            let parallelstorage = parallelTrait.storage;
            let parallelStack = parallelstorage.getStackInSlot(0);
            if (!parallelStack.isEmpty()) {
                parallelCount = parallelStack.count;
            }
        }
    } catch (e) {
        console.error("Error accessing parallel_slot: " + e);
    }

    // 计算速度倍数（确保至少为1，避免除以0）
    let finallyupgrade = Math.max(1, 2 * upgradeCount0 + 4 * upgradeCount1 + 8 * upgradeCount2); // 使用max确保至少为1

    // 应用并行处理和速度修改
    let parallelRecipe = machine.applyParallel(recipe, parallelCount);
    let copyRecipe = parallelRecipe.copy();
    copyRecipe.duration = Math.max(1, Math.ceil(recipe.duration / finallyupgrade)); // 确保持续时间至少为1

    mbdEvent.setRecipe(copyRecipe);
});
