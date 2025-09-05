// src/components/compCreateConversation.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useConversationStore } from '@/store/conversationStore';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  MessageCircle,
  User,
  Palette,
  DollarSign,
  Calendar,
  FileText,
  Send,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  Loader2
} from 'lucide-react';
import type { CreateConversationData } from '@/lib/types/conversationTypes';

// Компонент для анимированных частиц
function CreateConversationParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        >
          <Sparkles 
            className="w-2 h-2 text-blue-400 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент поиска пользователей
function UserSearch({ 
  selectedUserId, 
  onUserSelect 
}: { 
  selectedUserId: string;
  onUserSelect: (userId: string, username: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');
  const { t } = useTranslation();

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserSelect = (user: any) => {
    onUserSelect(user.id, user.username);
    setSelectedUsername(user.username);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {t('conversationParticipant')}
      </Label>
      
      {selectedUserId ? (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">{selectedUsername}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onUserSelect('', '');
              setSelectedUsername('');
            }}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
          >
            ×
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('findUserByName')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
          
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {user.username}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t('startTypingUsername')}
      </p>
    </div>
  );
}

export function CompCreateConversation() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const { 
    topics, 
    loading, 
    error, 
    fetchTopics, 
    createConversation 
  } = useConversationStore();

  const [formData, setFormData] = useState<{
    participant_id: string;
    participant_username: string;
    topic_id: string;
    title: string;
    description: string;
    budget_min: string;
    budget_max: string;
    deadline: string;
    initial_message: string;
  }>({
    participant_id: '',
    participant_username: '',
    topic_id: '',
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    initial_message: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [creating, setCreating] = useState(false);

  // Загружаем темы при монтировании
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Валидация формы
  const validate = () => {
    const e: { [key: string]: string } = {};
    
    if (!formData.participant_id) e.participant_id = t('selectParticipant');
    if (!formData.topic_id) e.topic_id = t('selectTopic');
    if (!formData.title.trim()) e.title = t('titleRequired');
    if (formData.title.trim().length < 5) e.title = t('titleMinLength5');
    if (!formData.initial_message.trim()) e.initial_message = t('messageRequired');
    if (formData.initial_message.trim().length < 10) e.initial_message = t('messageMinLength');
    
    if (formData.budget_min && (isNaN(Number(formData.budget_min)) || Number(formData.budget_min) < 0)) {
      e.budget_min = t('budgetMinPositive');
    }
    if (formData.budget_max && (isNaN(Number(formData.budget_max)) || Number(formData.budget_max) < 0)) {
      e.budget_max = t('budgetMaxPositive');
    }
    if (formData.budget_min && formData.budget_max && Number(formData.budget_min) > Number(formData.budget_max)) {
      e.budget_max = t('budgetMaxNotLessThanMin');
    }
    
    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      e.deadline = t('deadlineMustBeFuture');
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setCreating(true);
    try {
      const conversationData: CreateConversationData = {
        participant_id: formData.participant_id,
        topic_id: Number(formData.topic_id),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        budget_min: formData.budget_min ? Number(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? Number(formData.budget_max) : undefined,
        deadline: formData.deadline || undefined,
        initial_message: formData.initial_message.trim(),
      };

      const conversationId = await createConversation(conversationData);
      
      toast.success(t('conversationCreated'), { 
        description: t('messageSent') 
      });
      
      navigate({ 
        to: '/route-conversation/$conversationId', 
        params: { conversationId } 
      });
    } catch (error) {
      toast.error(t('errorCreatingConversation'), { 
        description: error instanceof Error ? error.message : t('tryAgain') 
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedTopic = topics.find(t => t.id === Number(formData.topic_id));

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-200 dark:from-blue-800 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('authorizationRequired')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('pleaseLoginForMessages')}
            </p>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('returnToHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
      {/* Background effects */}
      <CreateConversationParticles />
      
      <div className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate({ to: "/route-conversations" })}
              className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('toDialogsList')}
            </Button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t('newConversation')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                {t('startDiscussionWithArtist')}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 border-0 shadow-2xl p-8 rounded-2xl backdrop-blur-sm relative">
            {creating && (
              <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('creatingDialog')}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* User Selection */}
              <UserSearch
                selectedUserId={formData.participant_id}
                onUserSelect={(userId, username) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    participant_id: userId, 
                    participant_username: username 
                  }));
                  if (errors.participant_id) {
                    setErrors(prev => ({ ...prev, participant_id: '' }));
                  }
                }}
              />
              {errors.participant_id && (
                <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.participant_id}
                </p>
              )}

              {/* Topic Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  {t('orderTopic')}
                </Label>
                <Select
                  value={formData.topic_id}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, topic_id: value }));
                    if (errors.topic_id) {
                      setErrors(prev => ({ ...prev, topic_id: '' }));
                    }
                  }}
                  disabled={creating}
                >
                  <SelectTrigger className={`h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm ${
                    errors.topic_id ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <SelectValue placeholder={t('selectOrderTopic')}>
                      {selectedTopic && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span>{selectedTopic.name}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{topic.name}</div>
                            {topic.description && (
                              <div className="text-xs text-gray-500">{topic.description}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.topic_id && (
                  <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.topic_id}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('conversationTitle')}
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: '' }));
                    }
                  }}
                  placeholder={t('titleExample')}
                  disabled={creating}
                  className={`h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm ${
                    errors.title ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('descriptionOptional')}
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('additionalOrderDetails')}
                  disabled={creating}
                  rows={3}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 resize-none"
                />
              </div>

              {/* Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('budgetFromUSD')}
                  </Label>
                  <Input
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, budget_min: e.target.value }));
                      if (errors.budget_min) {
                        setErrors(prev => ({ ...prev, budget_min: '' }));
                      }
                    }}
                    placeholder="100"
                    disabled={creating}
                    className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm ${
                      errors.budget_min ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.budget_min && (
                    <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.budget_min}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('budgetToUSD')}
                  </Label>
                  <Input
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, budget_max: e.target.value }));
                      if (errors.budget_max) {
                        setErrors(prev => ({ ...prev, budget_max: '' }));
                      }
                    }}
                    placeholder="500"
                    disabled={creating}
                    className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm ${
                      errors.budget_max ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.budget_max && (
                    <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.budget_max}
                    </p>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('deadlineOptional')}
                </Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, deadline: e.target.value }));
                    if (errors.deadline) {
                      setErrors(prev => ({ ...prev, deadline: '' }));
                    }
                  }}
                  disabled={creating}
                  min={new Date().toISOString().split('T')[0]}
                  className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm ${
                    errors.deadline ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                {errors.deadline && (
                  <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deadline}
                  </p>
                )}
              </div>

              {/* Initial Message */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {t('initialMessage')}
                </Label>
                <Textarea
                  value={formData.initial_message}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, initial_message: e.target.value }));
                    if (errors.initial_message) {
                      setErrors(prev => ({ ...prev, initial_message: '' }));
                    }
                  }}
                  placeholder={t('describeWhatInterests')}
                  disabled={creating}
                  rows={4}
                  className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm resize-none ${
                    errors.initial_message ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                {errors.initial_message && (
                  <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.initial_message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('thisMessageWillBeSentFirst')}
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={creating || loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('creatingDialog')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {t('createConversation')}
                  </div>
                )}
              </Button>
            </div>

            {/* Error display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}