import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../utils/hooks';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { toast } from 'react-toastify';
import { EmployeeForm, EmployeeFormData } from './EmployeeForm';


type Employee = {
	_id: string;
	name: string;
	email: string;
	role: 'Admin' | 'Editor' | 'Viewer';
	isActive: boolean;
	deletedAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

type PageResponse = {
	items: Employee[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export function EmployeesPage() {
	const token = useAppSelector((s) => s.auth.accessToken);
	const me = useAppSelector((s) => s.auth.user);
	const [data, setData] = useState<PageResponse | null>(null);
	const [page, setPage] = useState(1);
	const [limit] = useState(5);
	const [search, setSearch] = useState('');
	const [role, setRole] = useState<string>('');
	const [active, setActive] = useState<string>('');
	const [visible, setIsVisible] = useState<boolean>(false);
	const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [employeeData, setEmployeeData] = useState<Partial<EmployeeFormData> | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		const params = new URLSearchParams();
		params.set('page', String(page));
		params.set('limit', String(limit));
		if (search) params.set('search', search);
		if (role) params.set('role', role);
		if (active) params.set('isActive', active);
		fetch(`/api/employees?${params.toString()}`, {
			headers: { Authorization: `Bearer ${token}` },
			credentials: 'include',
			signal: controller.signal
		})
			.then((r) => r.json())
			.then(setData)
			.catch(() => {});
		return () => controller.abort();
	}, [page, limit, search, role, active, token]);

	const loadEmployeeData = async (id: string) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/employees/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
				credentials: 'include'
			});
			if (!res.ok) throw new Error('Failed to load');
			const json = await res.json();
			setEmployeeData(json);
		} catch (e) {
			toast.error('Failed to load employee');
		} finally {
			setLoading(false);
		}
	};

	const openSidebar = (employeeId: string | null = null) => {
		setEditingEmployeeId(employeeId);
		setIsVisible(true);
		if (employeeId) {
			loadEmployeeData(employeeId);
		} else {
			setEmployeeData(null);
		}
	};

	const closeSidebar = () => {
		setIsVisible(false);
		setEditingEmployeeId(null);
		setEmployeeData(null);
	};

	const onFormSubmit = async (data: EmployeeFormData) => {
		setIsSubmitting(true);
		const method = editingEmployeeId ? 'PUT' : 'POST';
		const url = editingEmployeeId ? `/api/employees/${editingEmployeeId}` : '/api/employees';
		
		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				credentials: 'include',
				body: JSON.stringify(data)
			});
			if (!res.ok) {
				toast.error('Save failed');
			} else {
				toast.success('Saved');
				closeSidebar();
				// Refresh the employee list
				const params = new URLSearchParams();
				params.set('page', String(page));
				params.set('limit', String(limit));
				if (search) params.set('search', search);
				if (role) params.set('role', role);
				if (active) params.set('isActive', active);
				fetch(`/api/employees?${params.toString()}`, {
					headers: { Authorization: `Bearer ${token}` },
					credentials: 'include'
				})
					.then((r) => r.json())
					.then(setData)
					.catch(() => {});
			}
		} catch (e) {
			toast.error('Save failed');
		} finally {
			setIsSubmitting(false);
		}
	};

	const canCreate = useMemo(() => me?.role === 'Admin' || me?.role === 'Editor', [me?.role]);
	const canEdit = canCreate;
	const canDelete = me?.role === 'Admin';

	return (
		<div className="w-full flex flex-column gap-4 m-4">
			<h2>Employees</h2>
			<div className="flex justify-content-between align-items-center">
			<div className="flex gap-2">
				<InputText placeholder="Search name/email" value={search} onChange={(e) => setSearch(e.target.value)} />
				<Dropdown 
					value={role} 
					onChange={(e: { value: string }) => setRole(e.value)} 
					options={[
						{ label: 'All Roles', value: '' },
						{ label: 'Admin', value: 'Admin' },
						{ label: 'Editor', value: 'Editor' },
						{ label: 'Viewer', value: 'Viewer' }
					]} 
					optionLabel="label"
					optionValue="value"
					placeholder="All Roles" 
					className="w-full md:w-14rem" 
				/>
				<Dropdown 
					value={active} 
					onChange={(e: { value: string }) => setActive(e.value)} 
					options={[
						{ label: 'All Status', value: '' },
						{ label: 'Active', value: 'true' },
						{ label: 'Inactive', value: 'false' }
					]} 
					optionLabel="label"
					optionValue="value"
					placeholder="All Status" 
					className="w-full md:w-14rem" 
				/>
			</div>
				{canCreate && <Button onClick={() => openSidebar(null)}>Add Employee</Button>}
			</div>
			<DataTable
				value={data?.items ?? []}
				paginator
				rows={limit}
				first={(page - 1) * limit}
				totalRecords={data?.total ?? 0}
				onPage={(e) => {
					// e.page is 0-based
					setPage((e.page ?? 0) + 1);
					// rows change handled by e.rows if we want to support it
					// but our limit is fixed for now
				}}
				responsiveLayout="scroll"
				emptyMessage="No employees"
			>
				<Column field="name" header="Name" sortable body={(row: Employee) => (
						<div className={`${canEdit ? "cursor-pointer":""}`} onClick={() => canEdit&& openSidebar(row._id)} >
							{row.name}
						</div>
					)} />
				<Column field="email" header="Email" sortable />
				<Column field="role" header="Role" />
				<Column field="isActive" header="Status" body={(row: Employee) => (row.isActive ? 'Active' : 'Inactive')} />
				<Column
					header="Actions"
					body={(row: Employee) => (
						<div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
							{canDelete && <Link to={`/employees/${row._id}?action=delete`}>Delete</Link>}
						</div>
					)}
				/>
			</DataTable>
			<Sidebar position="right" visible={visible}onHide={()=>''} style={{ width: '50vw' }}>
				<div className="flex flex-column gap-3">
					<EmployeeForm
						initialData={employeeData || undefined}
						onSubmit={onFormSubmit}
						onCancel={closeSidebar}
						editingEmployeeId={editingEmployeeId}
						loading={loading}
						isSubmitting={isSubmitting}
					/>
				</div>
			</Sidebar>
		</div>
	);
}


