package com.yuzyilinizinde.oyun;

import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.AuthenticationResult;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.LeaderboardsClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.tasks.Task;

/**
 * Google Play Games Services (v2) köprüsü: oturum açma, skor gönderme ve liderlik tablosu.
 *
 * Kimlikler res/values/games-ids.xml dosyasındadır (Play Console → Play Games Services →
 * Yapılandırma → "Kaynakları al" ile verilen değerler). SDK, OyunUygulamasi sınıfında
 * başlatılır. Proje kimliği girilmemişse eklenti "kullanılamaz" yanıtı verir ve oyun liderlik
 * düğmesini göstermez; uygulama yine sorunsuz çalışır.
 *
 * JavaScript tarafı (js/platform.js):
 *   Capacitor.Plugins.PlayGames.status()                       → { available, authenticated }
 *   Capacitor.Plugins.PlayGames.signIn()                       → { authenticated }
 *   Capacitor.Plugins.PlayGames.submitScore({ leaderboard, score })
 *   Capacitor.Plugins.PlayGames.showLeaderboard({ leaderboard })
 *   Capacitor.Plugins.PlayGames.showAllLeaderboards()
 * "leaderboard" anahtarı games-ids.xml içindeki leaderboard_<anahtar> kaynağına karşılık gelir
 * (ör. "distance" → leaderboard_distance).
 */
@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {

    private static final String TAG = "PlayGames";
    private boolean configured = false;

    @Override
    public void load() {
        // SDK, OyunUygulamasi (Application) içinde başlatılır; burada yalnızca durumu okunur
        configured = OyunUygulamasi.playGamesReady;
        if (!configured) Logger.info(TAG, "Play Games kapalı: games-ids.xml içine proje kimliği girilmemiş.");
    }

    // ------------------------------------------------------------ yardımcılar

    private String stringRes(String name) {
        int id = getContext().getResources().getIdentifier(name, "string", getContext().getPackageName());
        if (id == 0) return null;
        String v = getContext().getString(id);
        return v == null ? null : v.trim();
    }

    /** Liderlik tablosu kimlikleri "CgkI" ile başlar. */
    private String leaderboardId(PluginCall call) {
        String key = call.getString("leaderboard", "distance");
        if (key == null || !key.matches("[a-z0-9_]+")) return null;
        String id = stringRes("leaderboard_" + key);
        if (id == null || !id.startsWith("Cg")) return null;
        return id;
    }

    private GamesSignInClient signInClient() {
        return PlayGames.getGamesSignInClient(getActivity());
    }

    private LeaderboardsClient leaderboards() {
        return PlayGames.getLeaderboardsClient(getActivity());
    }

    private static boolean isAuthenticated(Task<AuthenticationResult> task) {
        return task.isSuccessful() && task.getResult() != null && task.getResult().isAuthenticated();
    }

    private boolean notConfigured(PluginCall call) {
        if (configured) return false;
        call.reject("Play Games yapılandırılmamış", "NOT_CONFIGURED");
        return true;
    }

    // ------------------------------------------------------------ JS yöntemleri

    @PluginMethod
    public void status(PluginCall call) {
        final JSObject ret = new JSObject();
        ret.put("available", configured);
        if (!configured) {
            ret.put("authenticated", false);
            call.resolve(ret);
            return;
        }
        try {
            signInClient().isAuthenticated().addOnCompleteListener((task) -> {
                ret.put("authenticated", isAuthenticated(task));
                call.resolve(ret);
            });
        } catch (Exception e) {
            ret.put("authenticated", false);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        if (notConfigured(call)) return;
        try {
            signInClient().signIn().addOnCompleteListener((task) -> {
                JSObject ret = new JSObject();
                ret.put("authenticated", isAuthenticated(task));
                call.resolve(ret);
            });
        } catch (Exception e) {
            call.reject("Oturum açılamadı", "SIGN_IN_FAILED", e);
        }
    }

    @PluginMethod
    public void submitScore(PluginCall call) {
        if (notConfigured(call)) return;
        String id = leaderboardId(call);
        Long score = call.getLong("score");
        if (id == null) {
            call.reject("Liderlik tablosu kimliği bulunamadı", "NO_LEADERBOARD");
            return;
        }
        if (score == null || score < 0) {
            call.reject("Geçersiz skor", "BAD_SCORE");
            return;
        }
        try {
            leaderboards()
                .submitScoreImmediate(id, score)
                .addOnCompleteListener((task) -> {
                    if (task.isSuccessful()) call.resolve();
                    else call.reject("Skor gönderilemedi", "SUBMIT_FAILED", task.getException());
                });
        } catch (Exception e) {
            call.reject("Skor gönderilemedi", "SUBMIT_FAILED", e);
        }
    }

    @PluginMethod
    public void showLeaderboard(PluginCall call) {
        if (notConfigured(call)) return;
        String id = leaderboardId(call);
        if (id == null) {
            call.reject("Liderlik tablosu kimliği bulunamadı", "NO_LEADERBOARD");
            return;
        }
        try {
            leaderboards()
                .getLeaderboardIntent(id)
                .addOnSuccessListener((intent) -> startActivityForResult(call, intent, "boardClosed"))
                .addOnFailureListener((e) -> call.reject("Liderlik tablosu açılamadı", "SHOW_FAILED", e));
        } catch (Exception e) {
            call.reject("Liderlik tablosu açılamadı", "SHOW_FAILED", e);
        }
    }

    @PluginMethod
    public void showAllLeaderboards(PluginCall call) {
        if (notConfigured(call)) return;
        try {
            leaderboards()
                .getAllLeaderboardsIntent()
                .addOnSuccessListener((intent) -> startActivityForResult(call, intent, "boardClosed"))
                .addOnFailureListener((e) -> call.reject("Liderlik tabloları açılamadı", "SHOW_FAILED", e));
        } catch (Exception e) {
            call.reject("Liderlik tabloları açılamadı", "SHOW_FAILED", e);
        }
    }

    @ActivityCallback
    private void boardClosed(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject ret = new JSObject();
        ret.put("resultCode", result.getResultCode());
        call.resolve(ret);
        getBridge().releaseCall(call);
    }
}
