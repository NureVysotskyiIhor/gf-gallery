//src\pages\HomePage.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Award,
  MessageCircle,
  Send,
  Edit,
  Phone,
  Instagram,
  Globe,
  Sparkles
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { WaveLoader } from "@/components/functions/loading";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { CompHomepageEditDialog } from "@/components/compHomepageEditDialog";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface HomepageProfile {
  id: number;
  email: string;
  full_name: string;
  title?: string;
  subtitle?: string;
  bio?: string;
  avatar_url?: string;
  background_image_url?: string;
  skills?: string[];
  contact_phone?: string;
  contact_telegram?: string;
  contact_instagram?: string;
  contact_website?: string;
  years_experience?: number;
  location?: string;
  education?: string;
  achievements?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Homepage() {
  const [profile, setProfile] = useState<HomepageProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Added missing state
  const { user } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loading && profile) {
      const timer = setTimeout(() => setIsVisible(true), 200);
      return () => clearTimeout(timer);
    }
  }, [loading, profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homepage_profile')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user && profile && user.email === profile.email;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <WaveLoader color="blue" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Загружаем портфолио...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-blue-900/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Профиль не найден
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Информация о художнице еще не добавлена
            </p>
            <Link to="/route-main-paintings">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <Palette className="w-4 h-4 mr-2" />
                Перейти к работам
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-blue-900/20 transition-all duration-1000 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Background Image */}
      {profile.background_image_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-5"
          style={{ backgroundImage: `url(${profile.background_image_url})` }}
        />
      )}

      {/* Ambient effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <section className={`text-center space-y-8 transition-all duration-1000 delay-200 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Avatar */}
          <div className="relative mx-auto w-48 h-48 group">
            <div className="w-full h-full rounded-full overflow-hidden border-8 border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Palette className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            {/* Floating particles */}
            <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute -top-1 -right-3 w-2 h-2 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.7s' }}></div>
            <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-2 -right-2 w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
            
            {canEdit && (
              <div className="absolute -bottom-2 -right-2">
                <Button
                  size="sm"
                  onClick={() => setEditDialogOpen(true)} // Added onClick handler
                  className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Name and Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
              {profile.full_name}
            </h1>
            {profile.title && (
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-2xl font-medium text-blue-600 dark:text-blue-400">
                  {profile.title}
                </p>
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            {profile.subtitle && (
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {profile.subtitle}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 flex-wrap">
            {profile.years_experience && (
              <div className="text-center group">
                <div className="flex items-center gap-2 text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8" />
                  {profile.years_experience}+
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">лет опыта</p>
              </div>
            )}
            {profile.location && (
              <div className="text-center group">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-red-500" />
                  {profile.location}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">местоположение</p>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/route-main-paintings">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
              >
                <Palette className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Посмотреть работы
              </Button>
            </Link>
            <Link to="/route-conversations">
              <Button 
                variant="outline"
                size="lg"
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 transform hover:scale-105 group"
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Написать мне
              </Button>
            </Link>
          </div>
        </section>

        {/* About Section */}
        {profile.bio && (
          <section className={`transition-all duration-1000 delay-400 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <Card className="max-w-4xl mx-auto bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  О художнице
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Skills & Details Grid */}
        <section className={`transition-all duration-1000 delay-600 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Навыки
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {profile.education && (
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <GraduationCap className="w-5 h-5 text-green-500" />
                    Образование
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {profile.education}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {profile.achievements && profile.achievements.length > 0 && (
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Award className="w-5 h-5 text-purple-500" />
                    Достижения
                  </h3>
                  <ul className="space-y-2">
                    {profile.achievements.map((achievement, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className={`transition-all duration-1000 delay-800 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <Card className="max-w-2xl mx-auto bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Связаться со мной
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.contact_telegram && (
                  <a 
                    href={`https://t.me/${profile.contact_telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300 group hover:-translate-y-1"
                  >
                    <Send className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Telegram</span>
                  </a>
                )}
                {profile.contact_instagram && (
                  <a 
                    href={`https://instagram.com/${profile.contact_instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-all duration-300 group hover:-translate-y-1"
                  >
                    <Instagram className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Instagram</span>
                  </a>
                )}
                {profile.contact_phone && (
                  <a 
                    href={`tel:${profile.contact_phone}`}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-300 group hover:-translate-y-1"
                  >
                    <Phone className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Телефон</span>
                  </a>
                )}
                {profile.contact_website && (
                  <a 
                    href={profile.contact_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-300 group hover:-translate-y-1"
                  >
                    <Globe className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Сайт</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Edit Dialog */}
      {canEdit && (
        <CompHomepageEditDialog 
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profile={profile}
          onSave={fetchProfile}
        />
      )}
    </div>
  );
}