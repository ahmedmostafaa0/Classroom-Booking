
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { HelpCircle, Search } from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is the Classroom Booking System?",
          answer: "The Classroom Booking System is a platform that allows students and faculty to reserve classrooms and other spaces on campus for academic purposes, study sessions, meetings, or events."
        },
        {
          question: "Who can use the Classroom Booking System?",
          answer: "All registered students, faculty members, and administrative staff can use the system. Each user type has different permission levels based on their role."
        },
        {
          question: "Is there a mobile app available?",
          answer: "Currently, we offer a responsive web application that works well on mobile devices. A dedicated mobile app is planned for future release."
        },
        {
          question: "How do I contact support if I have an issue?",
          answer: "You can reach our support team via email at support@classroombooking.com or through the Contact Us page on the website. Support hours are Monday to Friday, 9 AM to 5 PM."
        }
      ]
    },
    {
      category: "Account Management",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click on the 'Register' button on the homepage. Fill out the registration form with your institutional email address, create a password, and select your role (student or faculty)."
        },
        {
          question: "I forgot my password. How do I reset it?",
          answer: "Click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you instructions to reset your password."
        },
        {
          question: "How do I update my profile information?",
          answer: "Log in to your account, go to your Profile page by clicking on your name in the top right corner, and select 'Profile'. You can update your personal information there."
        },
        {
          question: "Can I change my email address?",
          answer: "Email addresses are linked to institutional accounts and cannot be changed directly. Please contact support if you need to update your email address."
        }
      ]
    },
    {
      category: "Booking Management",
      questions: [
        {
          question: "How far in advance can I book a classroom?",
          answer: "Regular users can book classrooms up to 2 weeks in advance. Faculty members can book up to 4 weeks in advance for academic purposes."
        },
        {
          question: "What information do I need to provide when booking a classroom?",
          answer: "You need to specify the date, start and end time, purpose of booking, and the classroom you want to reserve. Additional details may be required depending on the purpose."
        },
        {
          question: "How do I know if my booking is confirmed?",
          answer: "After submitting a booking request, you will receive an email notification. You can also check the status of your booking in the 'My Bookings' section of your dashboard."
        },
        {
          question: "Can I modify or cancel my booking?",
          answer: "Yes, you can modify or cancel your booking up to 24 hours before the scheduled time. Go to 'My Bookings' on your dashboard, find the booking, and click on 'Edit' or 'Cancel'."
        },
        {
          question: "Why was my booking request rejected?",
          answer: "Booking requests may be rejected if the room is already reserved, if there's a scheduling conflict, or if the purpose doesn't align with institutional policies. The rejection notification will include a specific reason."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          question: "The system says a room is already booked, but I can see it's empty. What should I do?",
          answer: "There might be a technical issue or the previous booking might have been cancelled recently. Contact support with the room number and time slot details for assistance."
        },
        {
          question: "I'm having trouble accessing the calendar view. What should I do?",
          answer: "Try clearing your browser cache and cookies, then reload the page. If the issue persists, try using a different web browser or contact support."
        },
        {
          question: "The website is loading slowly. How can I fix this?",
          answer: "Slow loading times can be due to internet connection issues or high system traffic. Try refreshing the page, using a different browser, or accessing the site during non-peak hours."
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = searchQuery 
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to frequently asked questions about the Classroom Booking System.
          </p>
        </div>
        
        <Separator />

        <Card className="p-6 bg-muted/50">
          <div className="space-y-4 text-center">
            <HelpCircle className="h-10 w-10 mx-auto text-primary" />
            <h2 className="text-2xl font-semibold">How can we help you?</h2>
            <div className="max-w-md mx-auto">
              <div className="flex w-full items-center space-x-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                {searchQuery && (
                  <Button variant="ghost" onClick={() => setSearchQuery('')} size="sm">
                    Clear
                  </Button>
                )}
              </div>
              {searchQuery && filteredFaqs.length === 0 && (
                <p className="mt-4 text-muted-foreground">No results found. Try different keywords or contact support.</p>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {filteredFaqs.map((category, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-semibold">{category.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <Card className="p-6 mt-8">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-medium">Still have questions?</h3>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Contact our support team for further assistance.
            </p>
            <Button asChild className="mt-2">
              <a href="/contact">Contact Support</a>
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Help;
