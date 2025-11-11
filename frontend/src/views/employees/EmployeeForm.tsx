import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

export const employeeSchema = z.object({
	name: z.string().min(3).max(50),
	username: z.string().min(3).max(20),
	email: z.string().email().max(100),
	phone: z.string().max(20).optional().or(z.literal('')),
	website: z.union([z.string().url().max(100), z.literal('')]).optional(),
	role: z.enum(['Admin', 'Editor', 'Viewer']),
	isActive: z.boolean(),
	skills: z.array(z.string().min(2).max(10)),
	availableSlots: z.array(z.string()),
	address: z.object({
		street: z.string().min(5).max(100),
		city: z.string().min(2).max(50),
		zipcode: z.string().regex(/^\d{5,10}$/)
	}),
	company: z.object({
		name: z.string().min(2).max(100)
	})
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

type EmployeeFormProps = {
	initialData?: Partial<EmployeeFormData>;
	onSubmit: (data: EmployeeFormData) => void | Promise<void>;
	onCancel: () => void;
	loading?: boolean;
	isSubmitting?: boolean;
	editingEmployeeId:any
};

export function EmployeeForm({ initialData, onSubmit, onCancel, loading = false, isSubmitting = false,editingEmployeeId }: EmployeeFormProps) {
	const [skillsText, setSkillsText] = useState('');
	const [slotsText, setSlotsText] = useState('');

	const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			skills: [],
			availableSlots: [],
			isActive: true,
			role: 'Viewer',
			address: {
				street: '',
				city: '',
				zipcode: ''
			},
			company: {
				name: ''
			},
			...initialData
		}
	});

	const isActiveValue = watch('isActive');

	useEffect(() => {
		if (initialData) {
			reset(initialData);
			if (Array.isArray(initialData.skills)) {
				setSkillsText(initialData.skills.join(', '));
			}
			if (Array.isArray(initialData.availableSlots)) {
				setSlotsText(initialData.availableSlots.join(', '));
			}
		} else {
			reset({
				skills: [],
				availableSlots: [],
				isActive: true,
				role: 'Viewer',
				address: {
					street: '',
					city: '',
					zipcode: ''
				},
				company: {
					name: ''
				}
			});
			setSkillsText('');
			setSlotsText('');
		}
	}, [initialData, reset]);

	const onFormSubmit = async (data: EmployeeFormData) => {
		const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
		const availableSlots = slotsText.split(',').map((s) => s.trim()).filter(Boolean);
		const payload = { ...data, skills, availableSlots };
		await onSubmit(payload);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-column gap-3">
			<div className='flex align-items-center justify-content-between'>
			<h2>{editingEmployeeId ? 'Edit Employee' : 'Add Employee'}</h2>
			<div className="flex gap-2 justify-content-end">
				<Button label="Cancel" severity="secondary" onClick={onCancel} type="button" />
				<Button label="Save" type="submit" disabled={isSubmitting} loading={isSubmitting} />
			</div>
			</div>
			<div className="grid">
				<div className="col-12 md:col-6 flex flex-column gap-2">
					<label htmlFor="name">Name *</label>
					<InputText id="name" {...register('name')} className={errors.name ? 'p-invalid' : ''} />
					{errors.name && <small className="p-error">{errors.name.message}</small>}
				</div>
				<div className="col-12 md:col-6 flex flex-column gap-2">
					<label htmlFor="username">Username *</label>
					<InputText id="username" {...register('username')} className={errors.username ? 'p-invalid' : ''} />
					{errors.username && <small className="p-error">{errors.username.message}</small>}
				</div>
				<div className="col-12 md:col-6 flex flex-column gap-2">
					<label htmlFor="email">Email *</label>
					<InputText id="email" type="email" {...register('email')} className={errors.email ? 'p-invalid' : ''} />
					{errors.email && <small className="p-error">{errors.email.message}</small>}
				</div>
				<div className="col-12 md:col-6 flex flex-column gap-2">
					<label htmlFor="phone">Phone</label>
					<InputText id="phone" {...register('phone')} className={errors.phone ? 'p-invalid' : ''} />
					{errors.phone && <small className="p-error">{errors.phone.message}</small>}
				</div>
				<div className="col-12 md:col-6 flex flex-column gap-2">
					<label htmlFor="website">Website</label>
					<InputText id="website" {...register('website')} className={errors.website ? 'p-invalid' : ''} />
					{errors.website && <small className="p-error">{errors.website.message}</small>}
				</div>
				<div className="col-12 md:col-6 flex flex-column gap-2">
					<label htmlFor="role">Role *</label>
					<Dropdown
						id="role"
						value={watch('role')}
						onChange={(e: { value: string }) => setValue('role', e.value as 'Admin' | 'Editor' | 'Viewer')}
						options={['Admin', 'Editor', 'Viewer']}
						className={errors.role ? 'p-invalid' : ''}
					/>
					{errors.role && <small className="p-error">{errors.role.message}</small>}
				</div>
				<div className="col-12 md:col-6 flex flex-column gap-2">
					<label htmlFor="isActive" className="flex align-items-center gap-2">
						<Checkbox
							id="isActive"
							checked={isActiveValue}
							onChange={(e: { checked: boolean | undefined }) => setValue('isActive', e.checked ?? false)}
						/>
						Active
					</label>
				</div>
				<div className="col-12 md:col-4 flex flex-column gap-2">
					<label htmlFor="street">Street *</label>
					<InputText id="street" {...register('address.street')} className={errors.address?.street ? 'p-invalid' : ''} />
					{errors.address?.street && <small className="p-error">{errors.address.street.message}</small>}
				</div>
				<div className="col-12 md:col-4 flex flex-column gap-2">
					<label htmlFor="city">City *</label>
					<InputText id="city" {...register('address.city')} className={errors.address?.city ? 'p-invalid' : ''} />
					{errors.address?.city && <small className="p-error">{errors.address.city.message}</small>}
				</div>
				<div className="col-12 md:col-4 flex flex-column gap-2">
					<label htmlFor="zipcode">Zipcode *</label>
					<InputText id="zipcode" {...register('address.zipcode')} className={errors.address?.zipcode ? 'p-invalid' : ''} />
					{errors.address?.zipcode && <small className="p-error">{errors.address.zipcode.message}</small>}
				</div>
				<div className="col-12 flex flex-column gap-2">
					<label htmlFor="company">Company Name *</label>
					<InputText id="company" {...register('company.name')} className={errors.company?.name ? 'p-invalid' : ''} />
					{errors.company?.name && <small className="p-error">{errors.company.name.message}</small>}
				</div>
				<div className="col-12 flex flex-column gap-2">
					<label htmlFor="skills">Skills (comma separated)</label>
					<InputText id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
				</div>
				<div className="col-12 flex flex-column gap-2">
					<label htmlFor="slots">Available Slots (ISO dates, comma separated)</label>
					<InputText id="slots" value={slotsText} onChange={(e) => setSlotsText(e.target.value)} />
				</div>
			</div>
			
		</form>
	);
}

