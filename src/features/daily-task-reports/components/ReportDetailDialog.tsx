"use client"

import { useEffect, useState } from "react"
import { useDailyTaskReportsStore } from "../store/daily-task-reports-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Star,
  Camera,
  Clock,
  User,
  MapPin,
  Package,
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useForm } from "react-hook-form"

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  reviewed: "bg-purple-100 text-purple-800",
}

const STATUS_LABELS: Record<string, string> = {
  assigned: "Ditugaskan",
  in_progress: "Sedang Dikerjakan",
  completed: "Selesai",
  reviewed: "Direview",
}

interface ReportDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: number | null
}

interface ReviewFormData {
  notes: string
  scores: { criteria_id: number; score: number }[]
}

export function ReportDetailDialog({
  open,
  onOpenChange,
  reportId,
}: ReportDetailDialogProps) {
  const {
    fetchById,
    fetchCriteria,
    selectedItem,
    criteria,
    isLoading,
    submitReview,
    isSubmittingReview,
  } = useDailyTaskReportsStore()

  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (reportId && open) {
      fetchById(reportId)
      fetchCriteria()
    }
  }, [reportId, open])

  const { register, handleSubmit, setValue, watch, reset } = useForm<ReviewFormData>({
    defaultValues: {
      notes: "",
      scores: [],
    },
  })

  // Initialize scores when criteria load
  useEffect(() => {
    if (criteria.length > 0) {
      const initialScores = criteria.map((c) => ({
        criteria_id: c.id,
        score: 0,
      }))
      setValue("scores", initialScores)
    }
  }, [criteria])

  const scores = watch("scores")

  const onSubmitReview = async (data: ReviewFormData) => {
    try {
      await submitReview(reportId!, {
        notes: data.notes || undefined,
        scores: data.scores.filter((s) => s.score > 0),
      })
      setShowReviewForm(false)
      reset()
    } catch (err) {
      // Error handled by store
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : selectedItem ? (
          <div className="space-y-4">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <Badge className={STATUS_COLORS[selectedItem.status]}>
                {STATUS_LABELS[selectedItem.status] || selectedItem.status}
              </Badge>
              {selectedItem.end_at && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedItem.end_at), "dd MMMM yyyy, HH:mm", {
                    locale: id,
                  })}
                </span>
              )}
            </div>

            {/* Employee & Task Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Employee</p>
                      <p className="font-medium">{selectedItem.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedItem.employee_code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Task Item</p>
                      <p className="font-medium">{selectedItem.item_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-medium">{selectedItem.area_name || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {selectedItem.duration_minutes
                          ? `${selectedItem.duration_minutes} minutes`
                          : "-"}
                      </p>
                      {selectedItem.target_minutes && (
                        <p className="text-xs text-muted-foreground">
                          Target: {selectedItem.target_minutes} min
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedItem.target_note && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes from Leader</p>
                    <p className="text-sm">{selectedItem.target_note}</p>
                  </div>
                )}

                {selectedItem.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Employee Notes</p>
                    <p className="text-sm">{selectedItem.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photos */}
            {selectedItem.photos && selectedItem.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photos ({selectedItem.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedItem.photos.map((photo) => (
                      <div key={photo.id}>
                        <p className="text-xs text-muted-foreground mb-1 capitalize">
                          {photo.type === "before" ? "📸 Before" : "📸 After"}
                        </p>
                        <img
                          src={photo.url}
                          alt={`${photo.type} photo`}
                          className="w-full h-40 object-cover rounded-md border"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tools, Chemicals, PPEs */}
            {(selectedItem.tools?.length > 0 ||
              selectedItem.chemicals?.length > 0 ||
              selectedItem.ppes?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Materials Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedItem.tools?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tools</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.tools.map((tool, i) => (
                            <Badge key={i} variant="outline">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedItem.chemicals?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Chemicals</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.chemicals.map((chemical, i) => (
                            <Badge key={i} variant="outline">
                              {chemical}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedItem.ppes?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">PPEs</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.ppes.map((ppe, i) => (
                            <Badge key={i} variant="outline">
                              {ppe}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Reviews ({selectedItem.reviews?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItem.reviews && selectedItem.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {selectedItem.reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{review.reviewer_name}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(review.reviewed_at),
                              "dd MMM yyyy, HH:mm",
                              { locale: id }
                            )}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {review.scores.map((score) => (
                            <div
                              key={score.criteria_id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{score.criteria_name}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= score.score
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {review.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {review.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reviews yet.
                    {selectedItem.status === "completed" && (
                      <span> Be the first to review!</span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Review Form */}
            {selectedItem.status === "completed" && !showReviewForm && (
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(true)}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            )}

            {showReviewForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submit Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                    {criteria.map((c) => {
                      const scoreItem = scores.find((s) => s.criteria_id === c.id)
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between"
                        >
                          <Label>{c.name}</Label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => {
                                  const newScores = scores.map((s) =>
                                    s.criteria_id === c.id ? { ...s, score: star } : s
                                  )
                                  setValue("scores", newScores)
                                }}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= (scoreItem?.score || 0)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  } transition-colors hover:text-yellow-500`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        {...register("notes")}
                        placeholder="Add any feedback..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false)
                          reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingReview || scores.every((s) => s.score === 0)}
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
