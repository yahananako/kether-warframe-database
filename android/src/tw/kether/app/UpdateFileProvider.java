package tw.kether.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

public class UpdateFileProvider extends ContentProvider {
    @Override public boolean onCreate() { return true; }

    private File updateFile(Uri uri) throws FileNotFoundException {
        if (uri == null || !"/update.apk".equals(uri.getPath())) throw new FileNotFoundException("Invalid update path");
        File file = new File(new File(getContext().getCacheDir(), "updates"), "update.apk");
        if (!file.isFile()) throw new FileNotFoundException("Update not found");
        return file;
    }

    @Override public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        if (!"r".equals(mode)) throw new FileNotFoundException("Read only");
        return ParcelFileDescriptor.open(updateFile(uri), ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override public String getType(Uri uri) { return "application/vnd.android.package-archive"; }

    @Override public Cursor query(Uri uri, String[] projection, String selection, String[] args, String order) {
        try {
            File file = updateFile(uri);
            String[] columns = projection == null || projection.length == 0
                ? new String[] { OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE }
                : projection;
            Object[] row = new Object[columns.length];
            for (int index = 0; index < columns.length; index++) {
                if (OpenableColumns.DISPLAY_NAME.equals(columns[index])) row[index] = "KETHER-Warframe-update.apk";
                else if (OpenableColumns.SIZE.equals(columns[index])) row[index] = file.length();
                else row[index] = null;
            }
            MatrixCursor cursor = new MatrixCursor(columns);
            cursor.addRow(row);
            return cursor;
        } catch (Exception ignored) { return null; }
    }

    @Override public Uri insert(Uri uri, ContentValues values) { throw new UnsupportedOperationException(); }
    @Override public int update(Uri uri, ContentValues values, String selection, String[] args) { return 0; }
    @Override public int delete(Uri uri, String selection, String[] args) { return 0; }
}
