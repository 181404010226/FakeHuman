import { _decorator, Component, Node, resources, sp, Asset, Button } from 'cc';
import { DataManager } from './DataManager';
import { CharacterManager } from './CharacterManager';
import { QuestionAnswerManager } from './QuestionAnswerManager';

const { ccclass, property } = _decorator;

@ccclass('GameFlowManager')
export class GameFlowManager extends Component {
    @property({
        type: DataManager,
        tooltip: '数据管理器引用'
    })
    dataManager: DataManager = null;

    @property({
        type: CharacterManager,
        tooltip: '角色管理器引用'
    })
    characterManager: CharacterManager = null;

    @property({
        type: QuestionAnswerManager,
        tooltip: '问答管理器引用'
    })
    questionAnswerManager: QuestionAnswerManager = null;

    @property({
        type: Button,
        tooltip: '放行按钮'
    })
    allowButton: Button = null;

    @property({
        type: Button,
        tooltip: '赶走按钮'
    })
    dismissButton: Button = null;

    // 当前关卡中的NPC索引
    private currentNpcIndex: number = -1;
    
    // 当前关卡的NPC列表
    private currentNpcs: any[] = [];

    start() {
        // 注册按钮事件
        this.registerButtonEvents();
        
        // 开始游戏流程
        this.startGameFlow();
    }

    /**
     * 注册按钮事件
     */
    private registerButtonEvents(): void {
        // 注册放行按钮点击事件
        if (this.allowButton) {
            this.allowButton.node.on(Button.EventType.CLICK, this.handleCharacterPassed, this);
        } else {
            console.error('放行按钮未设置');
        }
        
        // 注册赶走按钮点击事件
        if (this.dismissButton) {
            this.dismissButton.node.on(Button.EventType.CLICK, this.handleCharacterDismissed, this);
        } else {
            console.error('赶走按钮未设置');
        }
    }

    /**
     * 开始游戏流程
     */
    private startGameFlow(): void {
        // 获取当前关卡数据
        const currentLevel = this.dataManager.getCurrentLevel();
        if (!currentLevel) {
            console.error('无法获取当前关卡数据');
            return;
        }

        console.log(`开始关卡: ${currentLevel.name}`);
        
        // 获取当前关卡的NPC列表
        this.currentNpcs = currentLevel.npcs;
        
        // 重置NPC索引
        this.currentNpcIndex = -1;
        
        // 显示第一个NPC
        this.showNextNpc();
    }

    /**
     * 显示下一个NPC
     */
    public showNextNpc(): void {
        console.log('showNextNpc');
        this.currentNpcIndex++;
        
        // 检查是否还有NPC
        if (this.currentNpcIndex >= this.currentNpcs.length) {
            console.log('当前关卡所有NPC已处理完毕');
            // 可以在这里添加关卡完成逻辑
            return;
        }
        
        // 获取当前NPC数据
        const npc = this.currentNpcs[this.currentNpcIndex];
        
        // 配置问答对
        this.setupQuestionAnswers(npc.qaPairs);
        
        // 配置角色外观，并在完成后让角色入场
        this.characterManager.setupCharacterAppearance(npc.characterId, npc.skinName, () => {
            // 让角色入场（只有在外观设置完成后才执行）
            this.characterManager.characterEnter();
            
            // 启用按钮
            this.enableButtons();
        });
    }

    /**
     * 启用决策按钮
     */
    private enableButtons(): void {
        if (this.allowButton) {
            this.allowButton.interactable = true;
        }
        
        if (this.dismissButton) {
            this.dismissButton.interactable = true;
        }
    }
    
    /**
     * 禁用决策按钮
     */
    private disableButtons(): void {
        if (this.allowButton) {
            this.allowButton.interactable = false;
        }
        
        if (this.dismissButton) {
            this.dismissButton.interactable = false;
        }
    }

    /**
     * 设置问答对
     * @param qaPairs 问答对数组
     */
    private setupQuestionAnswers(qaPairs: any[]): void {
        if (!this.questionAnswerManager) {
            console.error('问答管理器未设置');
            return;
        }
        
        // 替换所有问答对（而不是添加）
        this.questionAnswerManager.replaceAllQuestionAnswers(qaPairs);
    }

    /**
     * 处理放行角色
     */
    public handleCharacterPassed(): void {
        // 禁用按钮，防止连续点击
        this.disableButtons();
        
        // 让角色向右移动，动画完成后显示下一个NPC
        this.characterManager.moveCharacterRight(() => {
            this.showNextNpc();
        });
    }

    /**
     * 处理赶走角色
     */
    public handleCharacterDismissed(): void {
        // 禁用按钮，防止连续点击
        this.disableButtons();
        
        // 让角色向左移动，动画完成后显示下一个NPC
        this.characterManager.moveCharacterLeft(() => {
            this.showNextNpc();
        });
    }

    /**
     * 组件销毁时清理事件监听
     */
    onDestroy() {
        // 移除按钮事件监听
        if (this.allowButton) {
            this.allowButton.node.off(Button.EventType.CLICK, this.handleCharacterPassed, this);
        }
        
        if (this.dismissButton) {
            this.dismissButton.node.off(Button.EventType.CLICK, this.handleCharacterDismissed, this);
        }
    }
}