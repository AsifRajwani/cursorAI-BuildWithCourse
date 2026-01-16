import 'dotenv/config';
import { db } from './index';
import { usersTable } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  // Create
  const user: typeof usersTable.$inferInsert = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
  };
  await db.insert(usersTable).values(user);
  console.log('New user created!');

  // Read
  const users = await db.select().from(usersTable);
  console.log('All users:', users);

  // Update
  await db
    .update(usersTable)
    .set({ age: 31 })
    .where(eq(usersTable.email, user.email));
  console.log('User updated!');

  // Delete
  await db.delete(usersTable).where(eq(usersTable.email, user.email));
  console.log('User deleted!');
}

main();
