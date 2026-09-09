import { Module } from "@nestjs/common";

import { PrismaModule } from "../database/prisma.module";
import { TodoController } from "./todo.controller";
import { TodoRepository } from "./todo.repository";
import { TodoService } from "./todo.service";

@Module({
  imports: [PrismaModule],
  controllers: [TodoController],
  providers: [TodoRepository, TodoService],
})
export class TodoModule {}
