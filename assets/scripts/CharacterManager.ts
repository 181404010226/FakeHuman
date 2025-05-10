import { _decorator, Component, Node, Button, Vec3, tween, Tween, resources, sp } from 'cc';
import { DialogueManager } from './DialogueManager';
const { ccclass, property } = _decorator;

@ccclass('CharacterManager')
export class CharacterManager extends Component {
    @property({
        type: DialogueManager,
        tooltip: '对话框管理器'
    })
    dialogueManager: DialogueManager = null;

    @property({
        type: Node,
        tooltip: '人物节点'
    })
    characterNode: Node = null;

    @property({
        type: Button,
        tooltip: '放行按钮（向右移动）'
    })
    letPassButton: Button = null;

    @property({
        type: Button,
        tooltip: '赶走按钮（向左移动）'
    })
    dismissButton: Button = null;

    @property({
        tooltip: '人物移动动画持续时间(秒)'
    })
    moveDuration: number = 1.0;

    @property({
        tooltip: '人物移动距离（像素）'
    })
    moveDistance: number = 300;
    
    private initialPosition: Vec3 = null;
    private currentAnimation: Tween<Node> = null;

    start() {
        // 记录人物初始位置
        if (this.characterNode) {
            this.initialPosition = this.characterNode.position.clone();
        }

        // 设置按钮事件监听
        if (this.letPassButton) {
            this.letPassButton.node.on(Button.EventType.CLICK, this.moveCharacterRight, this);
        }

        if (this.dismissButton) {
            this.dismissButton.node.on(Button.EventType.CLICK, this.moveCharacterLeft, this);
        }
    }
    
    /**
     * 设置角色外观
     * @param characterId 角色ID
     * @param skinName 皮肤名称
     */
    public setupCharacterAppearance(characterId: number, skinName: string): void {
        if (!this.characterNode) {
            console.error('人物节点未设置');
            return;
        }

        // 构建角色资源路径（左边补0确保两位数）
        const characterFolderName = characterId < 10 ? `0${characterId}` : `${characterId}`;
        const characterPath = `${characterFolderName}`;
        
        // 加载角色骨骼动画资源
        resources.load(`${characterPath}/${characterId}`, sp.SkeletonData, (err, skeletonData) => {
            if (err) {
                console.error(`加载角色资源失败: ${characterPath}/${characterId}`, err);
                return;
            }
            
            // 获取骨骼动画组件
            const skeletonComponent = this.characterNode.getComponent(sp.Skeleton);
            if (skeletonComponent) {
                // 设置骨骼数据
                skeletonComponent.skeletonData = skeletonData;

                skeletonComponent.setSkin(skinName);

                skeletonComponent.setAnimation(0, 'loop', true);
              
                console.log(`设置角色: ${characterId}, 皮肤: ${skinName}`);
            } else {
                console.error('人物节点上没有sp.Skeleton组件');
            }
        });
    }

    /**
     * 人物移动到右侧（放行）
     */
    public moveCharacterRight(): void {
        if (!this.characterNode || !this.initialPosition) return;

        // 隐藏对话框
        if (this.dialogueManager) {
            this.dialogueManager.hideDialogue();
        }

        // 停止当前动画
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // 目标位置：向右移动
        const targetPos = new Vec3(
            this.initialPosition.x + this.moveDistance,
            this.initialPosition.y,
            this.initialPosition.z
        );

        // 创建动画
        this.currentAnimation = tween(this.characterNode)
            .to(this.moveDuration, { position: targetPos }, { easing: 'cubicOut' })
            .call(() => {
                // 动画完成回调
                this.currentAnimation = null;
            })
            .start();
    }

    /**
     * 人物移动到左侧（赶走）
     */
    public moveCharacterLeft(): void {
        if (!this.characterNode || !this.initialPosition) return;

        // 隐藏对话框
        if (this.dialogueManager) {
            this.dialogueManager.hideDialogue();
        }

        // 停止当前动画
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // 目标位置：向左移动
        const targetPos = new Vec3(
            this.initialPosition.x - this.moveDistance,
            this.initialPosition.y,
            this.initialPosition.z
        );

        // 创建动画
        this.currentAnimation = tween(this.characterNode)
            .to(this.moveDuration, { position: targetPos }, { easing: 'cubicOut' })
            .call(() => {
                // 动画完成回调
                this.currentAnimation = null;
            })
            .start();
    }

    /**
     * 新人物从左向右进入
     */
    public characterEnter(): void {
        console.log('characterEnter');
        if (!this.characterNode) return;

        // 隐藏对话框
        if (this.dialogueManager) {
            this.dialogueManager.hideDialogue();
        }

        // 停止当前动画
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // 设置起始位置（在左侧）
        const startPos = new Vec3(
            this.initialPosition.x - this.moveDistance,
            this.initialPosition.y,
            this.initialPosition.z
        );
        this.characterNode.position = startPos;

        // 创建动画，移动到初始位置
        this.currentAnimation = tween(this.characterNode)
            .to(this.moveDuration, { position: this.initialPosition }, { easing: 'cubicOut' })
            .call(() => {
                // 动画完成回调
                this.currentAnimation = null;
            })
            .start();
    }

    /**
     * 重置人物位置到初始位置
     */
    public resetCharacterPosition(): void {
        if (this.characterNode && this.initialPosition) {
            // 停止当前动画
            if (this.currentAnimation) {
                this.currentAnimation.stop();
                this.currentAnimation = null;
            }

            // 直接设置到初始位置
            this.characterNode.position = this.initialPosition.clone();
        }
    }

    onDestroy() {
        // 移除按钮事件监听
        if (this.letPassButton) {
            this.letPassButton.node.off(Button.EventType.CLICK, this.moveCharacterRight, this);
        }

        if (this.dismissButton) {
            this.dismissButton.node.off(Button.EventType.CLICK, this.moveCharacterLeft, this);
        }
    }
}