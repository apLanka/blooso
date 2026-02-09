import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessContextGuard } from '../business/guards/business-context.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { AddTagDto } from './dto/add-tag.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('clients')
@Controller('v1/businesses/:id/clients')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: 'Create client' })
  @ApiResponse({ status: 201, description: 'Client created' })
  create(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientService.create(businessId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List clients (paginated, searchable)' })
  @ApiResponse({ status: 200, description: 'Paginated client list' })
  findAll(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clientService.findAll(businessId, user, {
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':clientId')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Client details' })
  findOne(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.clientService.findOne(businessId, clientId, user);
  }

  @Patch(':clientId')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Client updated' })
  update(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientService.update(businessId, clientId, user, dto);
  }

  @Delete(':clientId')
  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({ status: 200, description: 'Client deleted' })
  remove(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.clientService.remove(businessId, clientId, user);
  }

  @Get(':clientId/notes')
  @ApiOperation({ summary: 'List client notes' })
  @ApiResponse({ status: 200, description: 'List of notes' })
  listNotes(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.clientService.listNotes(businessId, clientId, user);
  }

  @Post(':clientId/notes')
  @ApiOperation({ summary: 'Create client note' })
  @ApiResponse({ status: 201, description: 'Note created' })
  createNote(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateNoteDto,
  ) {
    return this.clientService.createNote(businessId, clientId, user, dto);
  }

  @Delete(':clientId/notes/:noteId')
  @ApiOperation({ summary: 'Delete client note' })
  @ApiResponse({ status: 200, description: 'Note deleted' })
  deleteNote(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.clientService.deleteNote(
      businessId,
      clientId,
      noteId,
      user,
    );
  }

  @Post(':clientId/tags')
  @ApiOperation({ summary: 'Add tag to client' })
  @ApiResponse({ status: 201, description: 'Tag added' })
  addTag(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: AddTagDto,
  ) {
    return this.clientService.addTag(businessId, clientId, user, dto.tag);
  }

  @Delete(':clientId/tags/:tag')
  @ApiOperation({ summary: 'Remove tag from client' })
  @ApiResponse({ status: 200, description: 'Tag removed' })
  removeTag(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @Param('tag') tag: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.clientService.removeTag(businessId, clientId, tag, user);
  }

  @Get(':clientId/appointments')
  @ApiOperation({ summary: 'Get client appointment history' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  getAppointments(
    @Param('id') businessId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.clientService.getAppointments(businessId, clientId, user);
  }
}
