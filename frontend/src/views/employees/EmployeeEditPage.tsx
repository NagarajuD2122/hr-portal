import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../utils/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

const schema = z.object({
	name: z.string().min(3).max(50),
	username: z.string().min(3).max(20),
	email: z.string().email().max(100),
	phone: z.string().max(20).optional(),
	website: z.string().url().max(100).optional(),
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
type FormData = z.infer<typeof schema>;

export function EmployeeEditPage() {
	const { id } = useParams();
	const token = localStorage.getItem('auth:accessToken');
	const me = useAppSelector((s) => s.auth.user);
	const canEdit = useMemo(() => me?.role === 'Admin' || me?.role === 'Editor', [me?.role]);

	const [loading, setLoading] = useState(true);
	const [skillsText, setSkillsText] = useState('');
	const [slotsText, setSlotsText] = useState('');
	const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			skills: [],
			availableSlots: []
		}
	});

	useEffect(() => {
		if (id === 'new') {
			setLoading(false);
			return;
		}
		fetch(`/api/employees/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
			credentials: 'include'
		})
			.then(async (r) => {
				if (!r.ok) throw new Error('Failed to load');
				const json = await r.json();
				reset(json);
				if (Array.isArray(json.skills)) setSkillsText(json.skills.join(', '));
				if (Array.isArray(json.availableSlots)) setSlotsText(json.availableSlots.join(', '));
			})
			.catch(() => toast.error('Failed to load employee'))
			.finally(() => setLoading(false));
	}, [id, reset, token]);

	const onSubmit = async (data: FormData) => {
		const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
		const availableSlots = slotsText.split(',').map((s) => s.trim()).filter(Boolean);
		const payload = { ...data, skills, availableSlots };
		const method = id === 'new' ? 'POST' : 'PUT';
		const url = id === 'new' ? '/api/employees' : `/api/employees/${id}`;
		const res = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			credentials: 'include',
			body: JSON.stringify(payload)
		});
		if (!res.ok) {
			toast.error('Save failed');
		} else {
			toast.success('Saved');
		}
	};

	if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
	if (!canEdit) return <div style={{ padding: 24 }}>You do not have permission.</div>;

	return (
		<div style={{ maxWidth: 800, margin: '24px auto' }}>
			<h3>{id === 'new' ? 'Add Employee' : 'Edit Employee'}</h3>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
					<div>
						<label>Name</label>
						<input {...register('name')} />
						{errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
					</div>
					<div>
						<label>Username</label>
						<input {...register('username')} />
						{errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
					</div>
					<div>
						<label>Email</label>
						<input type="email" {...register('email')} />
						{errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
					</div>
					<div>
						<label>Phone</label>
						<input {...register('phone')} />
						{errors.phone && <p style={{ color: 'red' }}>{errors.phone.message}</p>}
					</div>
					<div>
						<label>Website</label>
						<input {...register('website')} />
						{errors.website && <p style={{ color: 'red' }}>{errors.website.message}</p>}
					</div>
					<div>
						<label>Role</label>
						<select {...register('role')}>
							<option>Admin</option>
							<option>Editor</option>
							<option>Viewer</option>
						</select>
					</div>
					<div>
						<label>Status</label>
						<select {...register('isActive', { setValueAs: (v) => v === 'true' })}>
							<option value="true">Active</option>
							<option value="false">Inactive</option>
						</select>
					</div>
					<div>
						<label>Street</label>
						<input {...register('address.street')} />
						{errors.address?.street && <p style={{ color: 'red' }}>{errors.address.street.message}</p>}
					</div>
					<div>
						<label>City</label>
						<input {...register('address.city')} />
						{errors.address?.city && <p style={{ color: 'red' }}>{errors.address.city.message}</p>}
					</div>
					<div>
						<label>Zipcode</label>
						<input {...register('address.zipcode')} />
						{errors.address?.zipcode && <p style={{ color: 'red' }}>{errors.address.zipcode.message}</p>}
					</div>
					<div>
						<label>Company</label>
						<input {...register('company.name')} />
						{errors.company?.name && <p style={{ color: 'red' }}>{errors.company.name.message}</p>}
					</div>
				</div>
				<div style={{ marginTop: 12 }}>
					<label>Skills (comma separated)</label>
					<input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
				</div>
				<div style={{ marginTop: 12 }}>
					<label>Available Slots (ISO dates, comma separated)</label>
					<input value={slotsText} onChange={(e) => setSlotsText(e.target.value)} />
				</div>

				<div style={{ marginTop: 16 }}>
					<button disabled={isSubmitting} type="submit">Save</button>
				</div>
			</form>
		</div>
	);
}


