import {
  Param,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppService, IVoteItem } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AddVoteItemDto, EditVoteItemDto } from './app.dto';
import { ResponseMessage } from './app.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('uservotes/:voteid')
  async uservotes(
    @Req() req: Request,
    @Param('voteid') voteid: string,
  ): Promise<ResponseMessage> {
    return new ResponseMessage(
      await this.appService.uservotes(voteid, req['user'].sub),
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('voteitem')
  async getAllVoteItem(): Promise<
    | {
        totalVote: number;
        voteitem: IVoteItem[];
      }
    | ResponseMessage
  > {
    try {
      return await this.appService.getAllVoteItem();
    } catch (err) {
      throw new InternalServerErrorException(
        new ResponseMessage(
          'An error occurred while fetching vote items.',
          err,
        ),
      );
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Post('voteitem')
  async addVoteItem(@Body() body: AddVoteItemDto): Promise<ResponseMessage> {
    return new ResponseMessage(
      await this.appService.addVoteItem(body.name, body.description),
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Put('voteitem')
  async editVoteItem(@Body() body: EditVoteItemDto): Promise<IVoteItem> {
    try {
      return await this.appService.editVoteItem(body.name, body.description);
    } catch (err) {
      throw new InternalServerErrorException(
        new ResponseMessage('An error occurred while edit vote items.', err),
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Delete('voteitem/:id')
  async deleteVoteItem(@Param('id') id: string): Promise<ResponseMessage> {
    try {
      return new ResponseMessage(await this.appService.deleteVoteItem(id));
    } catch (err) {
      throw new InternalServerErrorException(
        new ResponseMessage('An error occurred while delete vote items.', err),
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Delete('clearvote')
  async clearVoteData(): Promise<ResponseMessage> {
    try {
      return new ResponseMessage(await this.appService.clearVoteData());
    } catch (err) {
      throw new InternalServerErrorException(
        new ResponseMessage('An error occurred while clear vote data.', err),
      );
    }
  }
}
