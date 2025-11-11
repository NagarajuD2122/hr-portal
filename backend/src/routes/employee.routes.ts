import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { createEmployeeHandler, deleteEmployeeHandler, getEmployeeHandler, listEmployeesHandler, updateEmployeeHandler } from '../controllers/employee.controller.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware.js';
import { employeeCreateSchema, employeeUpdateSchema, employeeQuerySchema, employeeIdParamSchema } from '../validation/employee.schemas.js';

export const router = Router();

router.use(requireAuth);

router.get('/', validateQuery(employeeQuerySchema), listEmployeesHandler);
router.get('/:id', validateParams(employeeIdParamSchema), getEmployeeHandler);
router.post('/', requireRole(['Admin', 'Editor']), validateBody(employeeCreateSchema), createEmployeeHandler);
router.put('/:id', requireRole(['Admin', 'Editor']), validateParams(employeeIdParamSchema), validateBody(employeeUpdateSchema), updateEmployeeHandler);
router.delete('/:id', requireRole(['Admin']), validateParams(employeeIdParamSchema), deleteEmployeeHandler);


