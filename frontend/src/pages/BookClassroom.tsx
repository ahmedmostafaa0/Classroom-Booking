import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassroomCard } from "@/components/ClassroomCard";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { bookingsApi, classroomsApi } from "@/services/realApi";
import { Classroom } from "@/types";
import { CalendarCheck, CheckCircle, Clock } from "lucide-react";

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const BookClassroom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const preselectedClassroom = location.state?.selectedClassroom as
    | Classroom
    | undefined;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    preselectedClassroom || null,
  );
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkedAvailability, setCheckedAvailability] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    preselectedClassroom ? "booking" : "rooms",
  );

  const { data: classrooms = [], isLoading } = useQuery({
    queryKey: ["classrooms"],
    queryFn: classroomsApi.getClassrooms,
  });

  useEffect(() => {
    if (selectedClassroom) {
      setIsAvailable(null);
      setCheckedAvailability(false);
    }
  }, [selectedClassroom, selectedDate, startTime, endTime]);

  const switchToBookingTab = () => {
    setActiveTab("booking");
  };

  const switchToRoomsTab = () => {
    setActiveTab("rooms");
  };

  const checkAvailability = async () => {
    if (!selectedClassroom || !selectedDate || !startTime || !endTime) {
      toast({
        title: "Missing information",
        description:
          "Please select a classroom, date, start time, and end time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const date = format(selectedDate, "yyyy-MM-dd");
      const isAvailable = await bookingsApi.checkAvailability(
        selectedClassroom.id,
        date,
        startTime,
        endTime,
      );

      setIsAvailable(isAvailable);
      setCheckedAvailability(true);

      if (isAvailable) {
        toast({
          title: "Room available",
          description: "The classroom is available for the selected time.",
        });
      } else {
        toast({
          title: "Room unavailable",
          description: "The classroom is already booked for this time.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !user ||
      !selectedClassroom ||
      !selectedDate ||
      !startTime ||
      !endTime ||
      !purpose
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!checkedAvailability || !isAvailable) {
      toast({
        title: "Check availability first",
        description: "Please check if the room is available before booking.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const date = format(selectedDate, "yyyy-MM-dd");
      const booking = await bookingsApi.createBooking({
        userId: user.id,
        userName: user.name,
        classroomId: selectedClassroom.id,
        classroomName: selectedClassroom.name,
        date,
        startTime,
        endTime,
        purpose,
      });

      // If user is admin, immediately confirm the booking
      if (user.role === "admin" && booking.status === "pending") {
        await bookingsApi.updateBookingStatus(booking.id, "confirmed");
        toast({
          title: "Booking confirmed",
          description: "Your booking has been automatically confirmed.",
        });
      } else {
        toast({
          title: "Booking submitted",
          description: "Your booking request has been submitted successfully.",
        });
      }

      navigate("/bookings");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Book a Classroom
          </h1>
          <p className="text-muted-foreground">
            Select a classroom, date, and time to make a booking.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rooms">Select Classroom</TabsTrigger>
            <TabsTrigger
              value="booking"
              data-value="booking"
              disabled={!selectedClassroom}
            >
              Booking Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <Card
                        key={i}
                        className="h-[220px] animate-pulse bg-muted"
                      />
                    ))
                : classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className={`${
                        selectedClassroom?.id === classroom.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedClassroom(classroom);
                        switchToBookingTab(); // Automatically switch to booking tab when classroom is selected
                      }}
                    >
                      <ClassroomCard
                        classroom={classroom}
                        onBook={() => {
                          setSelectedClassroom(classroom);
                          switchToBookingTab();
                        }}
                      />
                    </div>
                  ))}
            </div>
          </TabsContent>

          <TabsContent value="booking">
            {selectedClassroom && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Information</CardTitle>
                    <CardDescription>
                      Fill in the details for your booking request.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      id="booking-form"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="classroom">Classroom</Label>
                        <div className="p-2 rounded-md bg-muted flex items-center">
                          <span>{selectedClassroom.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={switchToRoomsTab}
                          >
                            Change
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <div className="border rounded-md p-2">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            className="mx-auto p-0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Select
                            value={startTime}
                            onValueChange={setStartTime}
                          >
                            <SelectTrigger id="start-time">
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.slice(0, -1).map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Select
                            value={endTime}
                            onValueChange={setEndTime}
                            disabled={!startTime}
                          >
                            <SelectTrigger id="end-time">
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots
                                .filter((time) => time > startTime)
                                .map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Textarea
                          id="purpose"
                          placeholder="Describe the purpose of your booking..."
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      onClick={checkAvailability}
                      variant="outline"
                      className="w-full"
                      disabled={!selectedDate || !startTime || !endTime}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Check Availability
                    </Button>

                    {checkedAvailability && (
                      <div
                        className={`flex items-center justify-center w-full p-2 rounded-md ${
                          isAvailable
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span>Room is available at selected time</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Room is not available at this time</span>
                          </>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      form="booking-form"
                      className="w-full bg-booking-primary hover:bg-booking-primary/90"
                      disabled={
                        isSubmitting || !isAvailable || !checkedAvailability
                      }
                    >
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      {isSubmitting
                        ? "Submitting..."
                        : "Submit Booking Request"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription>
                      Review your booking details before submitting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">
                        Classroom:
                      </div>
                      <div className="text-sm font-medium">
                        {selectedClassroom.name}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Building:
                      </div>
                      <div className="text-sm font-medium">
                        {selectedClassroom.building}
                      </div>

                      <div className="text-sm text-muted-foreground">Room:</div>
                      <div className="text-sm font-medium">
                        {selectedClassroom.roomNumber}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Capacity:
                      </div>
                      <div className="text-sm font-medium">
                        {selectedClassroom.capacity} people
                      </div>

                      <div className="text-sm text-muted-foreground">Date:</div>
                      <div className="text-sm font-medium">
                        {selectedDate
                          ? format(selectedDate, "MMMM d, yyyy")
                          : "-"}
                      </div>

                      <div className="text-sm text-muted-foreground">Time:</div>
                      <div className="text-sm font-medium">
                        {startTime && endTime
                          ? `${startTime} - ${endTime}`
                          : "-"}
                      </div>

                      <div className="text-sm text-muted-foreground">User:</div>
                      <div className="text-sm font-medium">{user?.name}</div>

                      <div className="text-sm text-muted-foreground">
                        Purpose:
                      </div>
                      <div className="text-sm font-medium line-clamp-3">
                        {purpose || "-"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BookClassroom;
