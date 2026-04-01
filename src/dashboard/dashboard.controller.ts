import { Controller, Get } from '@nestjs/common';
import { Role } from '../common/role.enum';
import { Roles } from '../shared/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(Role.Viewer, Role.Analyst, Role.Admin)
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
