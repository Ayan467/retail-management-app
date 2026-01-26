import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { getEmployees } from '@/db/api';
import type { Employee } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employees</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          ) : employees.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.profile?.username || 'N/A'}
                      </TableCell>
                      <TableCell>{employee.profile?.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {employee.profile?.role?.replace('_', ' ') || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.position || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.status === 'active'
                              ? 'default'
                              : employee.status === 'on_leave'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {employee.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.profile?.email && <div>{employee.profile.email}</div>}
                          {employee.profile?.phone && <div>{employee.profile.phone}</div>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No employees found</h3>
              <p className="text-muted-foreground">
                Employee records will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
