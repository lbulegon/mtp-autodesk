!macro customInstall
  ; Configurações personalizadas de instalação
  SetRegView 64
  
  ; Registrar informações do aplicativo
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk" "DisplayName" "MTP Autodesk"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk" "DisplayIcon" "$INSTDIR\MTP Autodesk.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk" "Publisher" "MTP Autodesk"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk" "DisplayVersion" "1.0.0"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk" "NoRepair" 1
  
  ; Configurar permissões (comentado devido a problema de plugin)
  ; AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
!macroend

!macro customUnInstall
  ; Limpeza personalizada na desinstalação
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MTP Autodesk"
  
  ; Remover dados do aplicativo
  RMDir /r "$LOCALAPPDATA\MTP Autodesk"
  RMDir /r "$APPDATA\MTP Autodesk"
!macroend
