import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonLibService { 
    private readonly message: string = `Hello from ${CommonLibService.name}`;

    getHello(): string {
        return this.message;
    }
}