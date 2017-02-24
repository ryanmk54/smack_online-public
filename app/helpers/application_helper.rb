module ApplicationHelper

def flash_class(level)
  case level
    when 'notice'  then "flash alert alert-dismissable alert-info"
    when 'success' then "flash alert alert-dismissable alert-success"
    when 'error'   then "flash alert alert-dismissable alert-error"
    when 'alert'   then "flash alert alert-dismissable alert-error"
    else 'level'
  end
end

end
