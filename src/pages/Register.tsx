import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { userManagementService, type CreateUserRequest } from '@/services/userManagement';
import { Roles } from '@/constants/roles';

const DEFAULT_FORM: CreateUserRequest = {
  userName: '',
  email: '',
  password: '',
  fullName: '',
  role: Roles.InventoryManager,
};

const ManageUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserRequest>(DEFAULT_FORM);

  const managersQuery = useQuery({
    queryKey: ['users', 'managers'],
    queryFn: userManagementService.getManagers,
  });

  const cashiersQuery = useQuery({
    queryKey: ['users', 'cashiers'],
    queryFn: userManagementService.getCashiers,
  });

  const createUserMutation = useMutation({
    mutationFn: userManagementService.createUser,
    onSuccess: (user) => {
      toast({
        title: 'User created',
        description: `${user.fullName ?? user.userName} was added as a ${formData.role === Roles.InventoryManager ? 'manager' : 'cashier'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users', 'managers'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'cashiers'] });
      setFormData({ ...DEFAULT_FORM, role: formData.role });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to create user.';
      toast({
        title: 'Creation failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createUserMutation.mutate(formData);
  };

  const isLoading = useMemo(
    () =>
      managersQuery.isLoading ||
      cashiersQuery.isLoading ||
      createUserMutation.isPending,
    [cashiersQuery.isLoading, createUserMutation.isPending, managersQuery.isLoading],
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Manage team members</h1>
          <p className="text-muted-foreground">
            Create Inventory Manager and Cashier accounts. Each user receives role-based access automatically.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add a new team member</CardTitle>
            <CardDescription>Assign the appropriate role so they see the correct dashboard when signing in.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(event) => setFormData({ ...formData, userName: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: typeof Roles.InventoryManager | typeof Roles.Cashier) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Roles.InventoryManager}>Inventory Manager</SelectItem>
                    <SelectItem value={Roles.Cashier}>Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Creating user...' : 'Create user'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory managers</CardTitle>
              <CardDescription>People who can adjust stock levels and manage suppliers.</CardDescription>
            </CardHeader>
            <CardContent>
              {managersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading managers...</p>
              ) : managersQuery.isError ? (
                <p className="text-sm text-destructive">Unable to load managers.</p>
              ) : managersQuery.data?.length ? (
                <ul className="space-y-2">
                  {managersQuery.data.map((manager) => (
                    <li key={manager.id} className="border border-border rounded-md px-4 py-3">
                      <p className="font-medium">{manager.fullName ?? manager.userName}</p>
                      <p className="text-sm text-muted-foreground">{manager.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No managers yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cashiers</CardTitle>
              <CardDescription>Staff who process orders and checkouts.</CardDescription>
            </CardHeader>
            <CardContent>
              {cashiersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading cashiers...</p>
              ) : cashiersQuery.isError ? (
                <p className="text-sm text-destructive">Unable to load cashiers.</p>
              ) : cashiersQuery.data?.length ? (
                <ul className="space-y-2">
                  {cashiersQuery.data.map((cashier) => (
                    <li key={cashier.id} className="border border-border rounded-md px-4 py-3">
                      <p className="font-medium">{cashier.fullName ?? cashier.userName}</p>
                      <p className="text-sm text-muted-foreground">{cashier.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No cashiers yet.</p>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Need to remove someone? Use SQL Server Management Studio or add a delete endpoint when ready.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      {isLoading && <span className="sr-only">Loading</span>}
    </Layout>
  );
};

export default ManageUsers;
