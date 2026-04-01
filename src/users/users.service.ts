import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../common/entities';
import { UserStatus } from '../common/user-status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const now = new Date().toISOString();
    return this.usersRepository.create({
      ...createUserDto,
      status: UserStatus.Active,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async findByIdOrFail(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} was not found`);
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    if (dto.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    await this.findByIdOrFail(id);
    const updated = await this.usersRepository.update(id, dto);

    if (!updated) {
      throw new NotFoundException(`User ${id} was not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const removed = await this.usersRepository.remove(id);
    if (!removed) {
      throw new NotFoundException(`User ${id} was not found`);
    }
  }
}
