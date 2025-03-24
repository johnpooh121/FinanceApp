import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserId } from 'src/common/decorators/user.decorator';
import { UserGuard } from 'src/common/guards/user.guard';
import { PatchUserBody } from './dtos/patch-user.body';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @ApiOperation({ description: '유저 정보 불러오기' })
  @UseGuards(UserGuard)
  async getUser(@UserId() id: string) {
    return this.userService.getUserById(id);
  }

  @Patch('/')
  @ApiOperation({ description: '유저 정보 수정' })
  @UseGuards(UserGuard)
  async editUser(@UserId() id: string, @Body() body: PatchUserBody) {
    console.log(body);
    return this.userService.editUser(id, body);
  }
}
