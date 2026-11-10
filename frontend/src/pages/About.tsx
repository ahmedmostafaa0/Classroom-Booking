
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, MapPin, School, Users } from "lucide-react";

const About = () => {
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Our System</h1>
          <p className="text-muted-foreground mt-2">
            Learn more about our classroom booking platform and how it helps organize campus resources.
          </p>
        </div>
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>
              Streamlining the classroom booking process for everyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="leading-7">
              Our classroom booking system was developed to solve the challenges of managing limited classroom resources
              across a busy campus. We aim to provide a transparent, efficient way for students and faculty to find and 
              reserve the spaces they need for academic activities.
            </p>
            <p className="leading-7 mt-4">
              By digitizing the booking process, we've eliminated paperwork, reduced booking conflicts, and created 
              a platform that's accessible to all members of our academic community.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>For Students</CardTitle>
                <CardDescription>Book spaces for study groups and projects</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Easy access to available classrooms</li>
                <li>Book spaces for group projects</li>
                <li>Find rooms with specific equipment</li>
                <li>Manage your bookings in one place</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <School className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>For Faculty</CardTitle>
                <CardDescription>Schedule extra classes and office hours</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Book rooms for additional lectures</li>
                <li>Reserve spaces for special events</li>
                <li>Check classroom availability at a glance</li>
                <li>Receive booking confirmations automatically</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Campus Coverage</CardTitle>
                <CardDescription>Buildings and facilities across campus</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>All major academic buildings</li>
                <li>Specialized labs and workshops</li>
                <li>Seminar rooms and lecture halls</li>
                <li>Study spaces and meeting rooms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Booking Hours</CardTitle>
                <CardDescription>When you can book and use rooms</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Academic hours: 8:00 AM - 10:00 PM</li>
                <li>Weekend availability: 9:00 AM - 6:00 PM</li>
                <li>Advanced booking up to 2 weeks</li>
                <li>Special arrangements for events</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              How to Use Our System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li className="leading-relaxed">
                <span className="font-semibold">Create an account</span> - Sign up with your institutional email address.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold">Browse available rooms</span> - Use filters to find rooms that match your requirements.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold">Check availability</span> - View the calendar to see when rooms are free.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold">Make a booking</span> - Select your date, time, and purpose for the reservation.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold">Receive confirmation</span> - Get an email confirming your booking details.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold">Manage bookings</span> - View, modify or cancel your bookings from your dashboard.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default About;
