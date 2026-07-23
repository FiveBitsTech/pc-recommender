import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case'
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository'
import { LoginDto } from '../dto/login.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.loginUserUseCase.execute(body)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: { user: { sub: number } }) {
    const user = await this.userRepository.findById(req.user.sub)
    return { user }
  }
}
