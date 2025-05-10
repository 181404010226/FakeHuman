import { _decorator, Component, Node, JsonAsset, resources } from 'cc';
const { ccclass, property } = _decorator;

// 问答对接口
interface QAPair {
    question: string;
    answer: string;
}

// NPC接口
interface NPC {
    type: 'real' | 'fake';
    characterId: number;
    characterName: string;
    skinId: number;
    skinName: string;
    qaPairs: QAPair[];
}

// 关卡数据接口
interface LevelData {
    name: string;
    description: string;
    npcs: NPC[];
}

@ccclass('DataManager')
export class DataManager extends Component {
    // 允许策划将JSON资产拖放到此数组中
    @property({
        type: [JsonAsset],
        tooltip: '关卡JSON数据文件，顺序决定关卡顺序'
    })
    levelJsonAssets: JsonAsset[] = [];

    // 存储所有关卡数据
    private levels: LevelData[] = [];
    
    // 当前关卡索引
    private currentLevelIndex: number = 0;

    // 单例模式
    private static _instance: DataManager = null;
    public static get instance(): DataManager {
        return this._instance;
    }

    onLoad() {
        // 设置单例
        if (DataManager._instance === null) {
            DataManager._instance = this;
        } else {
            this.destroy();
            return;
        }
        
        // 加载所有关卡数据
        this.loadAllLevels();
    }

    /**
     * 加载所有关卡数据
     */
    private loadAllLevels(): void {
        this.levels = [];
        
        // 处理拖放到组件的JSON资产
        for (const jsonAsset of this.levelJsonAssets) {
            if (jsonAsset) {
                try {
                    const levelData = jsonAsset.json as LevelData;
                    this.levels.push(levelData);
                    console.log(`成功加载关卡: ${levelData.name}`);
                } catch (error) {
                    console.error(`加载关卡数据失败: ${jsonAsset.name}`, error);
                }
            }
        }

        console.log(`总共加载了 ${this.levels.length} 个关卡`);
    }

    /**
     * 获取当前关卡数据
     */
    public getCurrentLevel(): LevelData | null {
        if (this.levels.length === 0) {
            console.warn('没有加载任何关卡数据');
            return null;
        }
        
        if (this.currentLevelIndex < 0 || this.currentLevelIndex >= this.levels.length) {
            console.warn(`当前关卡索引 ${this.currentLevelIndex} 超出范围`);
            return null;
        }
        
        return this.levels[this.currentLevelIndex];
    }

    /**
     * 切换到下一个关卡
     * @returns 是否成功切换到下一关卡
     */
    public nextLevel(): boolean {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            console.log(`切换到关卡 ${this.currentLevelIndex + 1}: ${this.getCurrentLevel()?.name}`);
            return true;
        }
        
        console.log('已经是最后一个关卡');
        return false;
    }

    /**
     * 切换到上一个关卡
     * @returns 是否成功切换到上一关卡
     */
    public previousLevel(): boolean {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            console.log(`切换到关卡 ${this.currentLevelIndex + 1}: ${this.getCurrentLevel()?.name}`);
            return true;
        }
        
        console.log('已经是第一个关卡');
        return false;
    }

    /**
     * 切换到指定索引的关卡
     * @param index 关卡索引
     * @returns 是否成功切换
     */
    public setLevel(index: number): boolean {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIndex = index;
            console.log(`切换到关卡 ${index + 1}: ${this.getCurrentLevel()?.name}`);
            return true;
        }
        
        console.warn(`关卡索引 ${index} 超出范围`);
        return false;
    }

    /**
     * 获取当前关卡中的所有NPC
     */
    public getCurrentLevelNPCs(): NPC[] {
        const level = this.getCurrentLevel();
        return level ? level.npcs : [];
    }

    /**
     * 获取当前关卡中的真人NPC
     */
    public getRealNPCs(): NPC[] {
        const npcs = this.getCurrentLevelNPCs();
        return npcs.filter(npc => npc.type === 'real');
    }

    /**
     * 获取当前关卡中的伪人NPC
     */
    public getFakeNPCs(): NPC[] {
        const npcs = this.getCurrentLevelNPCs();
        return npcs.filter(npc => npc.type === 'fake');
    }

    /**
     * 根据角色ID获取NPC
     * @param characterId 角色ID
     */
    public getNPCById(characterId: number): NPC | null {
        const npcs = this.getCurrentLevelNPCs();
        return npcs.find(npc => npc.characterId === characterId) || null;
    }

    /**
     * 获取所有关卡数量
     */
    public getLevelCount(): number {
        return this.levels.length;
    }

    /**
     * 获取当前关卡索引
     */
    public getCurrentLevelIndex(): number {
        return this.currentLevelIndex;
    }

    /**
     * 重新加载所有关卡数据
     */
    public reloadAllLevels(): void {
        this.loadAllLevels();
    }
} 