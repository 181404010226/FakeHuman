import { _decorator, Component, Node, Button, Label } from 'cc';
import { DialogueManager } from './DialogueManager';
const { ccclass, property } = _decorator;

/**
 * 问答对接口
 */
interface QuestionAnswer {
    question: string;  // 问题文本
    answer: string;    // 回答文本
}

@ccclass('QuestionAnswerManager')
export class QuestionAnswerManager extends Component {
    @property({
        type: DialogueManager,
        tooltip: '对话管理器引用'
    })
    dialogueManager: DialogueManager = null;

    @property({
        type: [Button],
        tooltip: '问题按钮数组',
        readonly: true
    })
    questionButtons: Button[] = [];

    @property({
        type: [Node],
        tooltip: '问题文本节点数组（Label组件所在的节点）',
        readonly: true
    })
    questionLabels: Node[] = [];

    // 问答对数组
    private questionAnswerPairs: QuestionAnswer[] = [];
    
    // 当前显示的问题索引
    private currentQuestionIndices: number[] = [0, 1, 2];

    start() {
        // 初始化默认问答对
        // this.initDefaultQuestionAnswers();
        
        // 注册按钮事件
        this.registerButtons();
        
        // 更新问题按钮文本
        this.updateQuestionButtonTexts();
    }

    /**
     * 初始化默认问答对
     */
    private initDefaultQuestionAnswers(): void {
        // 添加一些默认的问答对
        this.questionAnswerPairs = [
            {
                question: "询问为何不在名单内？",
                answer: "我没见过你的资料。你确定你应该在这个区域吗？"
            },
            {
                question: "询问通行证？",
                answer: "你需要有效的通行证才能进入这个区域。没有通行证是不允许的。"
            },
            {
                question: "询问外貌？",
                answer: "我对你的外貌没有任何评价。我只负责确认身份。"
            },
            {
                question: "你是谁？",
                answer: "我是这个区域的安全管理员，负责身份验证和访问控制。"
            },
            {
                question: "这是什么地方？",
                answer: "这是一个受限制的区域，需要特殊许可才能进入。"
            },
            {
                question: "我可以离开吗？",
                answer: "如果你没有通行证，建议你尽快离开，否则可能会有麻烦。"
            }
        ];
    }

    /**
     * 注册所有问题按钮
     */
    private registerButtons(): void {
        // 注册每个按钮的点击事件
        for (let i = 0; i < this.questionButtons.length; i++) {
            const buttonIndex = i;
            if (this.questionButtons[i]) {
                this.questionButtons[i].node.on(Button.EventType.CLICK, () => {
                    this.onQuestionButtonClicked(buttonIndex);
                }, this);
            }
        }
    }

    /**
     * 更新问题按钮文本
     */
    private updateQuestionButtonTexts(): void {
        console.log('updateQuestionButtonTexts');
        // 为每个按钮设置对应的问题文本
        for (let i = 0; i < Math.min(this.questionLabels.length, this.currentQuestionIndices.length); i++) {
            const questionIndex = this.currentQuestionIndices[i];
            const labelNode = this.questionLabels[i];
            
            if (labelNode && questionIndex >= 0 && questionIndex < this.questionAnswerPairs.length) {
                // 获取Label组件并设置文本
                const label = labelNode.getComponent(Label);
                if (label) {
                    label.string = this.questionAnswerPairs[questionIndex].question;
                }
            }
        }
    }

    /**
     * 问题按钮点击回调
     * @param buttonIndex 按钮索引
     */
    private onQuestionButtonClicked(buttonIndex: number): void {
        if (buttonIndex < 0 || buttonIndex >= this.currentQuestionIndices.length) {
            return;
        }

        const questionIndex = this.currentQuestionIndices[buttonIndex];
        if (questionIndex < 0 || questionIndex >= this.questionAnswerPairs.length) {
            return;
        }

        // 获取问答对
        const qa = this.questionAnswerPairs[questionIndex];
        
        // 使用对话管理器显示回答
        if (this.dialogueManager && qa) {
            this.dialogueManager.showDialogue(qa.answer);
        }
    }

    /**
     * 添加新的问答对
     * @param questionAnswers 要添加的问答对数组
     */
    public addQuestionAnswers(questionAnswers: QuestionAnswer[]): void {
        if (!questionAnswers || questionAnswers.length === 0) {
            return;
        }

        // 添加新的问答对
        this.questionAnswerPairs = [...this.questionAnswerPairs, ...questionAnswers];
        
        // 更新按钮文本（如果需要）
        this.updateQuestionButtonTexts();
    }

    /**
     * 设置问题按钮显示的问题索引
     * @param indices 问题索引数组，长度应与按钮数量相同
     */
    public setQuestionIndices(indices: number[]): void {
        // 验证索引有效性
        const validIndices = indices.filter(index => 
            index >= 0 && index < this.questionAnswerPairs.length
        );

        // 更新当前显示的问题索引
        this.currentQuestionIndices = validIndices.slice(0, this.questionButtons.length);
        
        // 如果索引数量少于按钮数量，使用默认索引填充
        while (this.currentQuestionIndices.length < this.questionButtons.length) {
            const defaultIndex = this.currentQuestionIndices.length % this.questionAnswerPairs.length;
            this.currentQuestionIndices.push(defaultIndex);
        }
        
        // 更新按钮文本
        this.updateQuestionButtonTexts();
    }

    /**
     * 获取当前所有问答对
     * @returns 所有问答对数组
     */
    public getAllQuestionAnswers(): QuestionAnswer[] {
        return [...this.questionAnswerPairs];
    }

    /**
     * 清除所有问答对并重置为默认值
     */
    public resetToDefault(): void {
        this.initDefaultQuestionAnswers();
        this.currentQuestionIndices = [0, 1, 2];
        this.updateQuestionButtonTexts();
    }

    /**
     * 更新特定索引的问答对
     * @param index 要更新的问答对索引
     * @param newQA 新的问答对
     */
    public updateQuestionAnswer(index: number, newQA: QuestionAnswer): void {
        if (index >= 0 && index < this.questionAnswerPairs.length && newQA) {
            this.questionAnswerPairs[index] = newQA;
            this.updateQuestionButtonTexts();
        }
    }
    
    /**
     * 替换所有问答对并更新显示
     * @param newQAPairs 新的问答对数组
     */
    public replaceAllQuestionAnswers(newQAPairs: QuestionAnswer[]): void {
      
        if (!newQAPairs) {
            return;
        }
        
        // 替换问答对
        this.questionAnswerPairs = [...newQAPairs];
        
        // 重置问题索引为前三个
        this.currentQuestionIndices = [0, 1, 2];
        
        // 如果新问答对数量少于3个，调整索引
        while (this.currentQuestionIndices.length > 0 && 
               this.currentQuestionIndices[this.currentQuestionIndices.length - 1] >= this.questionAnswerPairs.length) {
            this.currentQuestionIndices.pop();
        }
        
        // 更新按钮文本
        this.updateQuestionButtonTexts();
    }
}