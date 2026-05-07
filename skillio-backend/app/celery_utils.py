from celery import Celery, Task
#configures celery in the project
def celery_init_app(app) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    
    # Set Redis as both the broker (queue) and backend (result storage)
    celery_app.config_from_object(app.config)
    celery_app.conf.update(
        broker_url='redis://localhost:6379/0',
        result_backend='redis://localhost:6379/0'
    )
    
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app