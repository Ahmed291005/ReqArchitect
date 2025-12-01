'use client';

import { useAppContext } from '@/context/app-state-provider';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { EditRequirementDialog } from './edit-requirement-dialog';
import { Separator } from '../ui/separator';
import { ListChecks, UserCog } from 'lucide-react';
import type { UserStory, Stakeholder } from '@/lib/types';


function UserStoryCard({ userStory }: { userStory: UserStory }) {
    return (
      <Card className="bg-background/50">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-medium">
            <span className="font-normal italic">{userStory.userPersona}</span>, I
            want to{' '}
            <span className="font-semibold not-italic">{userStory.feature}</span>{' '}
            <span className="font-normal italic">{userStory.benefit}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="h-4 w-4" />
            Acceptance Criteria
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {userStory.acceptanceCriteria.map((criterion, i) => (
              <li key={i}>{criterion}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }
  
function StakeholderCard({ stakeholder }: { stakeholder: Stakeholder }) {
    return (
        <Card className="bg-background/50">
        <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            {stakeholder.role}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground">{stakeholder.description}</p>
        </CardContent>
        </Card>
    );
}

export function RequirementsDashboard() {
  const { requirements, userStories, stakeholders } = useAppContext();

  return (
    <main className="flex-1 flex-col p-4 md:p-8 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>Requirement Repository</CardTitle>
          <CardDescription>
            View, manage, and export all project requirements from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={requirements} />
        </CardContent>
      </Card>

      {userStories.length > 0 && (
          <>
            <Separator className='my-8'/>
            <Card>
                <CardHeader>
                    <CardTitle>User Stories</CardTitle>
                    <CardDescription>
                        User stories generated from the functional requirements.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {userStories.map((story, i) => (
                        <UserStoryCard key={i} userStory={story} />
                    ))}
                </CardContent>
            </Card>
        </>
      )}

    {stakeholders.length > 0 && (
        <>
            <Separator className='my-8'/>
            <Card>
                <CardHeader>
                    <CardTitle>Stakeholders</CardTitle>
                    <CardDescription>
                        Potential stakeholders and user roles for the project.
                    </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4 md:grid-cols-2'>
                    {stakeholders.map((stakeholder, i) => (
                        <StakeholderCard key={i} stakeholder={stakeholder} />
                    ))}
                </CardContent>
            </Card>
        </>
    )}

      <EditRequirementDialog />
    </main>
  );
}
