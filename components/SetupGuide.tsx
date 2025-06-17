"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

export function SetupGuide() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Firebase Setup Required
        </CardTitle>
        <CardDescription>Follow these steps to configure Firebase for your RichNotes application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">
              1
            </Badge>
            <div className="space-y-2">
              <h3 className="font-semibold">Create Firebase Project</h3>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Firebase Console <ExternalLink className="h-3 w-3" />
                </a>{" "}
                and create a new project
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">
              2
            </Badge>
            <div className="space-y-2">
              <h3 className="font-semibold">Enable Authentication</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Go to Authentication → Sign-in method</li>
                <li>• Enable Google sign-in provider</li>
                <li>• Add your domain to Authorized domains</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">
              3
            </Badge>
            <div className="space-y-2">
              <h3 className="font-semibold">Setup Firestore Database</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Go to Firestore Database</li>
                <li>• Create database in production mode</li>
                <li>• Set up security rules (see below)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">
              4
            </Badge>
            <div className="space-y-2">
              <h3 className="font-semibold">Configure Environment Variables</h3>
              <p className="text-sm text-muted-foreground">Add these to your environment variables:</p>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">
                <div>NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key</div>
                <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain</div>
                <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id</div>
                <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket</div>
                <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id</div>
                <div>NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id</div>
                <div>XAI_API_KEY=your_xai_api_key</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">Firestore Security Rules</h3>
          <div className="bg-muted p-3 rounded-md text-sm font-mono">
            <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}`}</pre>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Authorized Domains Setup
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>To fix the "unauthorized domain" error:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to Firebase Console → Authentication → Settings</li>
              <li>Scroll down to "Authorized domains"</li>
              <li>Add your domain (e.g., localhost, your-app.vercel.app)</li>
              <li>
                For v0 preview, add: <code className="bg-muted px-1 rounded">v0.dev</code>
              </li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
