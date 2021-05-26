package org.gooddollar;

import com.facebook.react.ReactActivity;
import io.branch.rnbranch.*;
import android.content.Intent;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "GoodDollar";
  }

  @Override
  protected void onStart() {
    super.onStart();
    RNBranchModule.initSession(getIntent().getData(), this);
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    RNBranchModule.onNewIntent(intent);
  }

  @Override
  protected void onResume() {
    super.onResume();

    setForceNewBranchSession();
  }

  @Override
  protected void onRestart() {
    super.onRestart();

    setForceNewBranchSession();
  }

  private void setForceNewBranchSession() {
    Intent intent = getIntent();
    intent.putExtra("branch_force_new_session", true);

    setIntent(intent);
  }
}
