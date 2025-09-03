
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Checkbox } from './ui/checkbox'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { ThreadPoll, PollOption } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'

interface PollComponentProps {
  poll: ThreadPoll
  userVote?: string[]
  onVote?: (optionIds: string[]) => void
  showResults?: boolean
}

// Mock poll data for demo
const mockPoll: ThreadPoll = {
  id: '1',
  thread_id: '1',
  question: '¿Cuál consideras el mejor andar para competencias?',
  max_choices: 1,
  allow_multiple: false,
  allow_change_vote: true,
  show_results_without_vote: false,
  close_date: undefined,
  is_closed: false,
  total_votes: 47,
  created_at: new Date(Date.now() - 86400000).toISOString(),
  options: [
    {
      id: '1',
      poll_id: '1',
      option_text: 'Paso Fino',
      vote_count: 23,
      order_index: 0
    },
    {
      id: '2', 
      poll_id: '1',
      option_text: 'Trocha',
      vote_count: 15,
      order_index: 1
    },
    {
      id: '3',
      poll_id: '1', 
      option_text: 'Trocha y Galope',
      vote_count: 7,
      order_index: 2
    },
    {
      id: '4',
      poll_id: '1',
      option_text: 'Trote y Galope', 
      vote_count: 2,
      order_index: 3
    }
  ]
}

export function PollComponent({ 
  poll = mockPoll, 
  userVote = [], 
  onVote,
  showResults = false 
}: PollComponentProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userVote)
  const [hasVoted, setHasVoted] = useState(userVote.length > 0)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async () => {
    if (selectedOptions.length === 0) return
    
    setIsVoting(true)
    
    // Simulate API call
    setTimeout(() => {
      setHasVoted(true)
      setIsVoting(false)
      onVote?.(selectedOptions)
    }, 500)
  }

  const handleOptionChange = (optionId: string) => {
    if (poll.allow_multiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : prev.length < poll.max_choices 
            ? [...prev, optionId]
            : prev
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const getPercentage = (votes: number) => {
    return poll.total_votes > 0 ? (votes / poll.total_votes) * 100 : 0
  }

  const sortedOptions = [...poll.options].sort((a, b) => a.order_index - b.order_index)
  const showPollResults = hasVoted || showResults || poll.show_results_without_vote

  const isExpired = poll.close_date && new Date(poll.close_date) < new Date()
  const canVote = !hasVoted && !poll.is_closed && !isExpired

  return (
    <Card className="horse-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="mr-2 h-5 w-5 text-amber-600" />
            Encuesta
          </CardTitle>
          <div className="flex items-center space-x-2">
            {poll.is_closed && (
              <Badge variant="destructive">Cerrada</Badge>
            )}
            {isExpired && (
              <Badge variant="secondary">Expirada</Badge>
            )}
            {hasVoted && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Votaste
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {poll.question}
          </h3>
          
          {poll.max_choices > 1 && (
            <p className="text-sm text-muted-foreground">
              Puedes seleccionar hasta {poll.max_choices} opciones
            </p>
          )}
        </div>

        {/* Voting Interface */}
        {canVote && !showPollResults && (
          <div className="space-y-3">
            {poll.allow_multiple ? (
              <div className="space-y-2">
                {sortedOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => handleOptionChange(option.id)}
                      disabled={!selectedOptions.includes(option.id) && selectedOptions.length >= poll.max_choices}
                    />
                    <Label 
                      htmlFor={option.id} 
                      className="flex-1 cursor-pointer p-2 rounded-md hover:bg-accent"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup 
                value={selectedOptions[0] || ''} 
                onValueChange={(value) => setSelectedOptions([value])}
                className="space-y-2"
              >
                {sortedOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label 
                      htmlFor={option.id} 
                      className="flex-1 cursor-pointer p-2 rounded-md hover:bg-accent"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <Button 
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || isVoting}
              className="w-full btn-equestrian"
            >
              {isVoting ? 'Enviando voto...' : 'Votar'}
            </Button>
          </div>
        )}

        {/* Results */}
        {showPollResults && (
          <div className="space-y-3">
            {sortedOptions.map((option) => {
              const percentage = getPercentage(option.vote_count)
              const isUserChoice = userVote.includes(option.id)
              
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isUserChoice ? 'text-amber-600' : ''}`}>
                        {option.option_text}
                      </span>
                      {isUserChoice && (
                        <CheckCircle className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{option.vote_count} votos</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${isUserChoice ? '[&>*]:bg-amber-600' : ''}`}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Poll Info */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="mr-1 h-3 w-3" />
                <span>{poll.total_votes} votos</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>Creada {formatRelativeDate(poll.created_at)}</span>
              </div>
            </div>
            
            {poll.close_date && (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="mr-1 h-3 w-3" />
                <span>
                  {isExpired ? 'Expirada' : `Cierra ${formatRelativeDate(poll.close_date)}`}
                </span>
              </div>
            )}
          </div>

          {poll.allow_change_vote && hasVoted && !poll.is_closed && !isExpired && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setHasVoted(false)
                setSelectedOptions([])
              }}
              className="text-amber-600 border-amber-600 hover:bg-amber-50"
            >
              Cambiar voto
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
