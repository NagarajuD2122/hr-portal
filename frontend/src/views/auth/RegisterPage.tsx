import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { setCredentials } from '../../store/slices/auth.slice';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const schema = z.object({
	name: z.string().min(3).max(50),
	username: z.string().min(3).max(20),
	email: z.string().email().max(100),
	password: z.string().min(6).max(100)
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
		resolver: zodResolver(schema)
	});
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const onSubmit = async (data: FormData) => {
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Registration failed');
			const json = await res.json();
			dispatch(setCredentials({ accessToken: json.accessToken, user: json.user }));
			toast.success('Registered!');
			navigate('/dashboard', { replace: true });
		} catch (e: any) {
			toast.error(e.message ?? 'Registration failed');
		}
	};

	return (
		<div className=' m-auto flex flex-column mt-5'>
			<h2>Register</h2>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className='flex flex-column gap-2'>
					<label>Name</label>
					<InputText {...register('name')} />
					{errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
				</div>
				<div className='flex flex-column gap-2'>
					<label>Username</label>
					<InputText {...register('username')} />
					{errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
				</div>
				<div className='flex flex-column gap-2'>
					<label>Email</label>
					<InputText type="email" {...register('email')} />
					{errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
				</div>
				<div className='flex flex-column gap-2'>
					<label>Password</label>
					<InputText type="password" {...register('password')} />
					{errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
				</div>
				<Button className='w-full my-4' label='Register' type='submit' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} />
			</form>
			<p>
				Have an account? <Link to="/login">Login</Link>
			</p>
		</div>
	);
}


