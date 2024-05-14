import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import {
    CommandExecuteEvent,
    Message,
    PromptCommand,
    PromptOutput,
    PromptRequestEvent,
    SendMessageEvent,
    User,
} from '@progress/kendo-angular-conversational-ui';
import {
    SVGIcon,
    bellIcon,
    eyeIcon,
    infoCircleIcon,
    questionCircleIcon,
    warningCircleIcon,
    xIcon,
} from '@progress/kendo-svg-icons';
import { from, map, merge, Observable, scan, Subject } from 'rxjs';
import { ChatService } from './chat.service';
import { ConversationalUIModule } from "@progress/kendo-angular-conversational-ui";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { LayoutModule } from "@progress/kendo-angular-layout";
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-root',
    providers: [ChatService],
    standalone: true,
    imports: [
      RouterOutlet,
      CommonModule,
      ConversationalUIModule,
      ButtonsModule,
      InputsModule,
      LayoutModule,],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    public closeIcon: SVGIcon = xIcon;
    public eye: SVGIcon = eyeIcon;
    public feed: Observable<Message[]>;

    public readonly user: User = {
        id: 1,
    };

    public readonly bot: User = {
        id: 0,
    };

    public promptOutputs: PromptOutput[] = [];
    public activeView: number = 0;
    public idCounter = 0;

    public commands: PromptCommand[] = [
        {
            text: 'Command text 1',
            id: 0,
            icon: 'bell',
            svgIcon: bellIcon,
        },
        {
            text: 'Command text 2',
            id: 1,
            icon: 'info',
            svgIcon: infoCircleIcon,
        },
        {
            text: 'Command text 3',
            id: 2,
            icon: 'question',
            svgIcon: questionCircleIcon,
        },
        {
            text: 'Command text 4',
            id: 3,
            icon: 'warning',
            svgIcon: warningCircleIcon,
        },
    ];

    public suggestions: string[] = ['Suggеstion 1', 'Suggestion 2'];

    private local: Subject<Message> = new Subject<Message>();

    constructor(private svc: ChatService) {
        const hello: Message = {
            author: this.bot,
            suggestedActions: [
                {
                    type: 'reply',
                    value: 'Neat!',
                },
                {
                    type: 'reply',
                    value: 'Thanks, but this is boring.',
                },
            ],
            timestamp: new Date(),
            text: 'Hello, this is a demo bot. I don`t do much, but I can count symbols!',
        };

        this.feed = merge(
            from([hello]),
            this.local,
            this.svc.responses.pipe(
                map(
                    (response): Message => ({
                        author: this.bot,
                        text: response,
                    })
                )
            )
        ).pipe(scan((acc: Message[], x: Message) => [...acc, x], []));
    }

    public sendMessage(e: SendMessageEvent): void {
        this.local.next(e.message);

        this.local.next({
            author: this.bot,
            typing: true,
        });

        this.svc.submit(e.message.text || '');
    }

    public onPromptRequest(ev: PromptRequestEvent): void {
        if (!ev.prompt) {
            return;
        }
        this.createPromptOutput(ev);
        this.activeView = 1;
    }

    public onCommandExecute(ev: CommandExecuteEvent): void {
        this.createPromptOutput(ev);
        this.activeView = 1;
    }

    private createPromptOutput(ev: PromptRequestEvent | CommandExecuteEvent): void {
        this.idCounter += 1;
        const newOutput = {
            title: ev.isRetry ? 'Retry test title' : 'Test title',
            id: this.idCounter,
            prompt: ((ev as PromptRequestEvent).prompt
                ? (ev as PromptRequestEvent).prompt
                : (ev as CommandExecuteEvent).command.text) || '',
            output: 'Test content',
            isRetry: ev.isRetry,
            commandId: ((ev as PromptRequestEvent).prompt ? null : (ev as CommandExecuteEvent).command.id) || '',
        };
        this.promptOutputs.unshift(newOutput);
    }
}
