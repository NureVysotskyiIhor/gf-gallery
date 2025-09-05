//src\pages\HomePage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { 
  Palette, 
  Heart
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function Homepage() {
    const { t } = useTranslation();
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-blue-900/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('profileNotFound')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('informationAboutTheArtistHasNotBeenAddedYet')}
            </p>
            <Link to="/route-main-paintings">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <Palette className="w-4 h-4 mr-2" />
                {t('goToWorks')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
}