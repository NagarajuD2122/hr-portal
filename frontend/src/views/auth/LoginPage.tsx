import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks';
import { setCredentials } from '../../store/slices/auth.slice';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
		resolver: zodResolver(schema)
	});
	const navigate = useNavigate();
	const location = useLocation() as any;
	const dispatch = useAppDispatch();

	const onSubmit = async (data: FormData) => {
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Invalid credentials');
			const json = await res.json();
			dispatch(setCredentials({ accessToken: json.accessToken, user: json.user }));
			toast.success('Logged in!');
			const from = location.state?.from?.pathname ?? '/dashboard';
			navigate(from, { replace: true });
		} catch (e: any) {
			toast.error(e.message ?? 'Login failed');
		}
	};

	return (
		<div className=' m-auto flex flex-column mt-5 p-5 '>
			<h2>Login</h2>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className='flex flex-column gap-2'>
					<label>Email</label>
					<InputText type="email" {...register('email')} />
					{errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
				</div>
				<div className='flex flex-column gap-2 '>
					<label>Password</label>
					<InputText type="password" {...register('password')} />
					{errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
				</div>
				<Button className='w-full my-4' label='Login' type='submit' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} />
			</form>
			<p>
				No account? <Link to="/register">Register</Link>
			</p>
		</div>
	);
}


