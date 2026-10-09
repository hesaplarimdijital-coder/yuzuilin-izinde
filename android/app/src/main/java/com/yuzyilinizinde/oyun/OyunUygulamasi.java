package com.yuzyilinizinde.oyun;

import android.app.Application;
import android.util.Log;
import com.google.android.gms.games.PlayGamesSdk;

/**
 * Uygulama sınıfı: Google Play Games SDK'sı belgelerde önerildiği gibi burada başlatılır;
 * böylece oyun açılırken oturum kendiliğinden açılır ("Tekrar hoş geldin" bildirimi).
 * games-ids.xml içine proje kimliği girilmemişse SDK hiç başlatılmaz.
 */
public class OyunUygulamasi extends Application {

    /** Play Games yapılandırılmış ve SDK başlatılmış mı? (PlayGamesPlugin okur) */
    static boolean playGamesReady = false;

    @Override
    public void onCreate() {
        super.onCreate();
        if (!hasProjectId()) {
            Log.i("PlayGames", "Play Games yapılandırılmamış (games-ids.xml); liderlik tablosu kapalı.");
            return;
        }
        try {
            PlayGamesSdk.initialize(this);
            playGamesReady = true;
        } catch (Exception e) {
            Log.e("PlayGames", "Play Games SDK başlatılamadı", e);
        }
    }

    /** Play Console'daki proje kimliği yalnızca rakamlardan oluşur. */
    private boolean hasProjectId() {
        int id = getResources().getIdentifier("game_services_project_id", "string", getPackageName());
        if (id == 0) return false;
        String v = getString(id);
        return v != null && v.trim().matches("\\d{6,}");
    }
}
