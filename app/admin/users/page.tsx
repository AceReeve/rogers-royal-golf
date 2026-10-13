import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Calendar, UserCheck } from 'lucide-react'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function AdminUsersPage() {
  const supabase = createServiceRoleClient()
  const { data: users } = await supabase.auth.admin.listUsers()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-2">Manage registered users</p>
      </div>

      {users && users.users.length > 0 ? (
        <div className="space-y-4">
          {users.users.map((user: any) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">User ID</p>
                        <p className="font-mono text-xs break-all">{user.id.slice(0, 16)}...</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Joined</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                          <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          Active
                        </p>
                      </div>
                    </div>

                    {user.last_sign_in_at && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Last login: {new Date(user.last_sign_in_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground">No users yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
